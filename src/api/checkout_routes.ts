import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { CHECKOUT_ERROR_CODES } from "../lib/checkout_constants";
import { isCommercialPipelineEnabled } from "../lib/checkout_config";
import { incrementQuoteStaleTotal, recordCheckoutQuoteLatency } from "../services/checkout_metrics";
import {
  buildCheckoutQuote,
  couponApplyRequestSchema,
  evaluateCoupon,
} from "../services/checkout_quote_service";
import {
  commitCartHold,
  getHoldMetadata,
  getIdempotentResponse,
  newCorrelationId,
  rememberIdempotentResponse,
  releaseHoldById,
  reserveCartHold,
  updateHoldQuoteMetadata,
} from "../services/reservation_ledger";
import { ingestCheckoutCommerceFacts } from "../services/merchandising_checkout_ingest";
import { resolveRiskGateForSubmit } from "./risk_routes";
import {
  CHECKOUT_INTERNAL_ERROR_BODY,
  isCommitFailure,
  isReserveFailure,
  isRiskGateFailure,
} from "./checkout_unions";

let resolveRiskGateForSubmitImpl: typeof resolveRiskGateForSubmit = resolveRiskGateForSubmit;

export function setResolveRiskGateForSubmitForTests(
  impl: typeof resolveRiskGateForSubmit = resolveRiskGateForSubmit,
): void {
  resolveRiskGateForSubmitImpl = impl;
}

const cartLineSchema = z.object({
  sku: z.string().min(1),
  qty: z.number().int().positive(),
});

const preflightBodySchema = z
  .object({
    subtotal: z.number(),
    cart_id: z.string().min(1).optional(),
    lines: z.array(cartLineSchema).optional(),
    promo_codes: z.array(z.string()).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.lines && val.lines.length > 0 && !val.cart_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "cart_id is required when lines are provided",
        path: ["cart_id"],
      });
    }
  });

const commerceLineSchema = z.object({
  lineId: z.string().min(1),
  sku: z.string().min(1),
  qty: z.number().int().positive(),
  grossMinor: z.number().int().nonnegative(),
  taxBucket: z.enum(["standard", "reduced", "zero"]).default("standard"),
});

const commerceSchema = z.object({
  currency: z.string().length(3),
  channel: z.string().min(1).default("web"),
  discountMinor: z.number().int().nonnegative().optional(),
  shippingMinor: z.number().int().nonnegative().optional(),
  taxMinor: z.number().int().nonnegative().optional(),
  taxInclusiveMinor: z.number().int().nonnegative().optional(),
  lines: z.array(commerceLineSchema).min(1),
});

const submitBodySchema = z.object({
  cart_id: z.string().min(1),
  payment_method: z.string().min(1),
  gift_message: z.string().optional(),
  order_id: z.string().min(1).optional(),
  idempotency_key: z.string().min(1).optional(),
  commerce: commerceSchema.optional(),
  quote_version: z.union([z.number().int().positive(), z.string().min(1)]).optional(),
  organization_id: z.string().min(1).optional(),
  override_token: z.string().min(1).optional(),
  challenge_token: z.string().min(1).optional(),
});

const releaseBodySchema = z.object({
  hold_id: z.string().min(1),
});

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c as Buffer));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw) as unknown);
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function sendNoContent(res: ServerResponse): void {
  res.statusCode = 204;
  res.end();
}

function getAuthToken(req: IncomingMessage): string | undefined {
  const header = req.headers.authorization;
  if (!header || typeof header !== "string") {
    return undefined;
  }
  return header.startsWith("Bearer ") ? header.slice(7) : header;
}

export function parseAuthContext(token: string | undefined): { organizationId: string; email: string } | null {
  if (!token) {
    return null;
  }
  const parts = token.split(":");
  if (parts.length >= 2) {
    return { organizationId: parts[0], email: parts.slice(1).join(":") };
  }
  return { organizationId: "default", email: token };
}

function requireAuth(req: IncomingMessage, res: ServerResponse): { organizationId: string; email: string } | null {
  const ctx = parseAuthContext(getAuthToken(req));
  if (!ctx) {
    sendJson(res, 401, { error: "Unauthorized", code: CHECKOUT_ERROR_CODES.UNAUTHORIZED });
    return null;
  }
  return ctx;
}

function parseQuoteVersion(value: string | number | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "number") {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function trackQuoteLatency(started: number): void {
  recordCheckoutQuoteLatency(Math.max(0, Date.now() - started));
}

export async function handle_checkout_submit(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let parsed: unknown;
  try {
    parsed = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: "Invalid JSON", code: "INVALID_JSON" });
    return;
  }

  const result = submitBodySchema.safeParse(parsed);
  if (!result.success) {
    sendJson(res, 400, {
      error: "Validation failed",
      code: "VALIDATION_FAILED",
      details: result.error.flatten(),
    });
    return;
  }

  const body = result.data;
  const idempotencyKey = body.idempotency_key;
  if (idempotencyKey) {
    const cached = getIdempotentResponse(idempotencyKey);
    if (cached) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(cached);
      return;
    }
  }

  const quoteVersion = parseQuoteVersion(body.quote_version);
  const riskGate = resolveRiskGateForSubmitImpl({
    cartId: body.cart_id,
    quoteVersion: body.quote_version !== undefined ? String(body.quote_version) : undefined,
    organizationId: body.organization_id,
    overrideToken: body.override_token,
    challengeToken: body.challenge_token,
  });
  if (riskGate.ok === false) {
    if (!isRiskGateFailure(riskGate)) {
      sendJson(res, 500, CHECKOUT_INTERNAL_ERROR_BODY);
      return;
    }
    sendJson(res, riskGate.status, riskGate.body);
    return;
  }

  const correlationId = newCorrelationId();
  const orderRef = body.order_id ?? `ord_${randomUUID()}`;
  const occurredAt = new Date().toISOString();
  const enforceVersion = isCommercialPipelineEnabled();

  const commit = commitCartHold({
    cartId: body.cart_id,
    orderRef,
    correlationId,
    quoteVersion,
    enforceVersion,
  });

  if (commit.ok === false) {
    if (!isCommitFailure(commit)) {
      sendJson(res, 500, CHECKOUT_INTERNAL_ERROR_BODY);
      return;
    }
    if (commit.code === "QUOTE_STALE") {
      incrementQuoteStaleTotal();
    }
    sendJson(res, 409, {
      error:
        commit.code === "NO_ACTIVE_HOLD"
          ? "No active reservation for cart"
          : commit.code === "QUOTE_STALE"
            ? "Quote version is stale"
            : commit.code === "HOLD_EXPIRED"
              ? "Inventory hold has expired"
              : "Insufficient stock at commit",
      code: commit.code,
      ...(commit.skuId ? { skuId: commit.skuId } : {}),
    });
    return;
  }

  if (body.commerce) {
    ingestCheckoutCommerceFacts({
      orderRef: commit.orderRef,
      correlationId: commit.correlationId,
      occurredAt,
      currency: body.commerce.currency,
      channel: body.commerce.channel,
      discountMinor: body.commerce.discountMinor,
      shippingMinor: body.commerce.shippingMinor,
      taxMinor: body.commerce.taxMinor,
      taxInclusiveMinor: body.commerce.taxInclusiveMinor,
      lines: body.commerce.lines.map((l) => ({
        lineId: l.lineId,
        sku: l.sku,
        qty: l.qty,
        grossMinor: l.grossMinor,
        taxBucket: l.taxBucket,
      })),
    });
  }

  const payload = {
    status: "queued",
    snapshot: {
      cart_id: body.cart_id,
      order_ref: commit.orderRef,
      payment_method: body.payment_method,
      gift_message: body.gift_message,
      correlation_id: commit.correlationId,
      ...(riskGate.enforce && riskGate.evaluation
        ? { evaluation_id: riskGate.evaluation.id, risk_outcome: riskGate.evaluation.outcome }
        : {}),
    },
  };
  const responseJson = JSON.stringify(payload);
  if (idempotencyKey) {
    rememberIdempotentResponse(idempotencyKey, responseJson);
  }
  sendJson(res, 200, payload);
}

export async function handle_checkout_preflight(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const started = Date.now();
  const auth = requireAuth(req, res);
  if (!auth) {
    return;
  }

  let parsed: unknown;
  try {
    parsed = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: "Invalid JSON", code: "INVALID_JSON" });
    return;
  }

  const result = preflightBodySchema.safeParse(parsed);
  if (!result.success) {
    sendJson(res, 400, {
      error: "Validation failed",
      code: "VALIDATION_FAILED",
      details: result.error.flatten(),
    });
    return;
  }

  const body = result.data;
  if (Number.isNaN(body.subtotal) || body.subtotal < 0) {
    sendJson(res, 400, { message: "bad subtotal", code: "VALIDATION_FAILED" });
    return;
  }

  const correlationId = newCorrelationId();
  const legacyMode = !isCommercialPipelineEnabled();
  const quote = buildCheckoutQuote({
    subtotal: body.subtotal,
    promoCodes: body.promo_codes,
    correlationId,
    legacyMode,
  });

  let holdId: string | undefined;
  let expiresAt: string | null = null;

  if (body.lines && body.lines.length > 0 && body.cart_id) {
    const reserved = reserveCartHold({
      cartId: body.cart_id,
      lines: body.lines.map((line) => ({ sku: line.sku, qty: line.qty })),
      correlationId,
      organizationId: auth.organizationId,
      quoteVersion: quote.quote_version,
      promoCodes: body.promo_codes,
    });
    if (reserved.ok === false) {
      if (!isReserveFailure(reserved)) {
        sendJson(res, 500, CHECKOUT_INTERNAL_ERROR_BODY);
        return;
      }
      sendJson(res, 409, {
        error: "Not enough inventory to reserve",
        code: reserved.code,
        skuId: reserved.skuId,
      });
      return;
    }
    holdId = reserved.holdId;
    expiresAt = reserved.expiresAt;
  }

  trackQuoteLatency(started);
  sendJson(res, 200, {
    ...quote,
    ...(holdId ? { hold_id: holdId } : {}),
    ...(expiresAt ? { expires_at: expiresAt } : {}),
    ok: true,
  });
}

export async function handle_coupon_apply(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const started = Date.now();
  const auth = requireAuth(req, res);
  if (!auth) {
    return;
  }

  let parsed: unknown;
  try {
    parsed = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: "Invalid JSON", code: "INVALID_JSON" });
    return;
  }

  const parsedBody = couponApplyRequestSchema.safeParse(parsed);
  if (!parsedBody.success) {
    sendJson(res, 400, {
      error: "Validation failed",
      code: "VALIDATION_FAILED",
      details: parsedBody.error.flatten(),
    });
    return;
  }

  const body = parsedBody.data;
  const code = body.code.trim();
  if (!code) {
    sendJson(res, 400, { error: "Coupon code must not be empty", code: "VALIDATION_FAILED" });
    return;
  }

  if (!isCommercialPipelineEnabled()) {
    trackQuoteLatency(started);
    sendJson(res, 200, { applied: true, code });
    return;
  }

  const holdMeta = getHoldMetadata(body.cart_id);
  const subtotal = body.subtotal ?? 0;
  const currentQuoteVersion = holdMeta?.quoteVersion ?? 1;
  const correlationId = newCorrelationId();
  const outcome = evaluateCoupon({
    code,
    subtotal,
    currentQuoteVersion,
    promoCodes: holdMeta?.promoCodes,
    correlationId,
  });

  if (!outcome.ok || !outcome.quote) {
    trackQuoteLatency(started);
    sendJson(res, 422, { error: outcome.code ?? CHECKOUT_ERROR_CODES.COUPON_EXPIRED, code: outcome.code });
    return;
  }

  if (holdMeta) {
    updateHoldQuoteMetadata({
      cartId: body.cart_id,
      quoteVersion: outcome.quote.quote_version,
      correlationId: outcome.quote.correlation_id,
      promoCodes: holdMeta.promoCodes
        ? [...holdMeta.promoCodes, code.toUpperCase()]
        : [code.toUpperCase()],
    });
  }

  trackQuoteLatency(started);
  sendJson(res, 200, outcome.quote);
}

export async function handle_checkout_release(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const auth = requireAuth(req, res);
  if (!auth) {
    return;
  }

  let parsed: unknown;
  try {
    parsed = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: "Invalid JSON", code: "INVALID_JSON" });
    return;
  }

  const parsedBody = releaseBodySchema.safeParse(parsed);
  if (!parsedBody.success) {
    sendJson(res, 400, {
      error: "Validation failed",
      code: "VALIDATION_FAILED",
      details: parsedBody.error.flatten(),
    });
    return;
  }

  const released = releaseHoldById({
    holdId: parsedBody.data.hold_id,
    organizationId: auth.organizationId,
    correlationId: newCorrelationId(),
  });

  if (released.ok === false) {
    sendJson(res, 403, {
      error: "Forbidden",
      code: CHECKOUT_ERROR_CODES.FORBIDDEN,
    });
    return;
  }

  sendNoContent(res);
}
