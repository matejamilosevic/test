import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  commitCartHold,
  getIdempotentResponse,
  newCorrelationId,
  rememberIdempotentResponse,
  reserveCartHold,
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
  quote_version: z.string().min(1).optional(),
  organization_id: z.string().min(1).optional(),
  override_token: z.string().min(1).optional(),
  challenge_token: z.string().min(1).optional(),
});

const couponBodySchema = z.object({
  code: z.string().min(1),
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

  const riskGate = resolveRiskGateForSubmitImpl({
    cartId: body.cart_id,
    quoteVersion: body.quote_version,
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

  const commit = commitCartHold({
    cartId: body.cart_id,
    orderRef,
    correlationId,
  });

  if (commit.ok === false) {
    if (!isCommitFailure(commit)) {
      sendJson(res, 500, CHECKOUT_INTERNAL_ERROR_BODY);
      return;
    }
    sendJson(res, 409, {
      error: commit.code === "NO_ACTIVE_HOLD" ? "No active reservation for cart" : "Insufficient stock at commit",
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

  if (body.lines && body.lines.length > 0 && body.cart_id) {
    const reserved = reserveCartHold({
      cartId: body.cart_id,
      lines: body.lines.map((line) => ({ sku: line.sku, qty: line.qty })),
      correlationId,
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
  }

  sendJson(res, 200, {
    ok: true,
    estimate: { subtotal: body.subtotal, fees: 0 },
    correlation_id: correlationId,
  });
}

export async function handle_coupon_apply(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let parsed: unknown;
  try {
    parsed = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: "Invalid JSON", code: "INVALID_JSON" });
    return;
  }

  const parsedBody = couponBodySchema.safeParse(parsed);
  if (!parsedBody.success) {
    sendJson(res, 400, {
      error: "Validation failed",
      code: "VALIDATION_FAILED",
      details: parsedBody.error.flatten(),
    });
    return;
  }

  const code = parsedBody.data.code.trim();
  if (!code) {
    sendJson(res, 400, { error: "Coupon code must not be empty", code: "VALIDATION_FAILED" });
    return;
  }

  sendJson(res, 200, { applied: true, code });
}
