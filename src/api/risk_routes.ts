import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { RISK_ERROR_CODES } from "../lib/risk_constants";
import { isRiskGateEnabled, isRiskShadowMode } from "../lib/risk_config";
import { riskEvaluationInputSchema } from "../lib/risk_schemas";
import { evaluateCheckoutRisk } from "../services/risk_engine";
import {
  applyRiskOverride,
  consumeOverrideToken,
  createReviewCase,
  getCachedEvaluation,
  getReviewCase,
  getRiskEvaluationById,
  listReviewCases,
  persistRiskEvaluation,
} from "../services/risk_store";

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

function getAuthToken(req: IncomingMessage): string | undefined {
  const header = req.headers.authorization;
  if (!header || typeof header !== "string") {
    return undefined;
  }
  return header.startsWith("Bearer ") ? header.slice(7) : header;
}

function requireAuth(req: IncomingMessage, res: ServerResponse): boolean {
  if (!getAuthToken(req)) {
    sendJson(res, 401, { error: "Unauthorized", code: "UNAUTHORIZED" });
    return false;
  }
  return true;
}

export async function handle_checkout_risk_eval(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!requireAuth(req, res)) {
    return;
  }

  let parsed: unknown;
  try {
    parsed = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: "Invalid JSON", code: "INVALID_JSON" });
    return;
  }

  const result = riskEvaluationInputSchema.safeParse(parsed);
  if (!result.success) {
    sendJson(res, 400, {
      error: "Validation failed",
      code: "VALIDATION_FAILED",
      details: result.error.flatten(),
    });
    return;
  }

  const input = result.data;
  const started = Date.now();
  const scored = evaluateCheckoutRisk(input);
  const record = persistRiskEvaluation({
    organizationId: input.organization_id,
    cartId: input.cart_id,
    quoteVersion: input.quote_version,
    score: scored.score,
    outcome: scored.outcome,
    hits: scored.hits,
    rawInput: input,
    latencyMs: Date.now() - started,
  });

  if (scored.outcome === "review") {
    createReviewCase({
      organizationId: input.organization_id,
      evaluationId: record.id,
      cartId: input.cart_id,
    });
  }

  sendJson(res, 200, {
    evaluation_id: record.id,
    outcome: record.outcome,
    score: record.score,
    hits: record.hits,
  });
}

const reviewOverrideSchema = z.object({
  organization_id: z.string().min(1),
  actor_id: z.string().min(1),
  reason: z.string().min(1),
  ticket_id: z.string().optional(),
});

export async function handle_risk_review_cases_list(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!requireAuth(req, res)) {
    return;
  }

  const url = new URL(req.url ?? "/", "http://local");
  const organizationId = url.searchParams.get("organization_id");
  if (!organizationId) {
    sendJson(res, 400, { error: "organization_id is required", code: "VALIDATION_FAILED" });
    return;
  }

  sendJson(res, 200, { cases: listReviewCases(organizationId) });
}

export async function handle_risk_review_case_get(req: IncomingMessage, res: ServerResponse, caseId: string): Promise<void> {
  if (!requireAuth(req, res)) {
    return;
  }

  const url = new URL(req.url ?? "/", "http://local");
  const organizationId = url.searchParams.get("organization_id");
  if (!organizationId) {
    sendJson(res, 400, { error: "organization_id is required", code: "VALIDATION_FAILED" });
    return;
  }

  const reviewCase = getReviewCase(caseId, organizationId);
  if (!reviewCase) {
    sendJson(res, 403, { error: "Forbidden", code: "FORBIDDEN" });
    return;
  }

  sendJson(res, 200, { case: reviewCase });
}

export async function handle_risk_review_case_override(
  req: IncomingMessage,
  res: ServerResponse,
  caseId: string,
): Promise<void> {
  if (!requireAuth(req, res)) {
    return;
  }

  let parsed: unknown;
  try {
    parsed = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: "Invalid JSON", code: "INVALID_JSON" });
    return;
  }

  const result = reviewOverrideSchema.safeParse(parsed);
  if (!result.success) {
    sendJson(res, 400, {
      error: "Validation failed",
      code: "VALIDATION_FAILED",
      details: result.error.flatten(),
    });
    return;
  }

  const applied = applyRiskOverride({
    caseId,
    organizationId: result.data.organization_id,
    actorId: result.data.actor_id,
    reason: result.data.reason,
  });

  if (!applied) {
    sendJson(res, 404, { error: "Review case not found", code: "NOT_FOUND" });
    return;
  }

  sendJson(res, 200, {
    case: applied.reviewCase,
    override_token: applied.overrideToken,
  });
}

export function resolveRiskGateForSubmit(input: {
  cartId: string;
  quoteVersion?: string;
  organizationId?: string;
  overrideToken?: string;
  challengeToken?: string;
}):
  | { ok: true; enforce: false }
  | { ok: true; enforce: true; evaluation: NonNullable<ReturnType<typeof getCachedEvaluation>> }
  | { ok: false; status: number; body: Record<string, unknown> } {
  if (!isRiskGateEnabled()) {
    return { ok: true, enforce: false };
  }

  if (!input.quoteVersion) {
    return {
      ok: false,
      status: 400,
      body: {
        error: "Risk evaluation required before submit",
        code: RISK_ERROR_CODES.RISK_EVAL_REQUIRED,
      },
    };
  }

  const organizationId = input.organizationId ?? "default-org";
  if (input.overrideToken) {
    if (consumeOverrideToken(input.overrideToken, input.cartId, organizationId)) {
      return { ok: true, enforce: false };
    }
  }

  const evaluation = getCachedEvaluation(input.cartId, input.quoteVersion);
  if (!evaluation) {
    return {
      ok: false,
      status: 400,
      body: {
        error: "Risk evaluation required before submit",
        code: RISK_ERROR_CODES.RISK_EVAL_REQUIRED,
      },
    };
  }

  if (evaluation.organizationId !== organizationId) {
    return {
      ok: false,
      status: 403,
      body: { error: "Forbidden", code: "FORBIDDEN" },
    };
  }

  if (isRiskShadowMode()) {
    return { ok: true, enforce: true, evaluation };
  }

  if (evaluation.outcome === "block") {
    return {
      ok: false,
      status: 403,
      body: {
        error: "Checkout declined by risk policy",
        code: RISK_ERROR_CODES.RISK_DECLINED,
        support_reference_id: evaluation.id,
      },
    };
  }

  if (evaluation.outcome === "review") {
    const openCase = listReviewCases(organizationId).find(
      (c) => c.evaluationId === evaluation.id && c.status === "open",
    );
    return {
      ok: false,
      status: 202,
      body: {
        status: "pending_review",
        evaluation_id: evaluation.id,
        review_case_id: openCase?.id,
      },
    };
  }

  if (evaluation.outcome === "challenge" && !input.challengeToken) {
    return {
      ok: false,
      status: 400,
      body: {
        error: "Challenge token required",
        code: RISK_ERROR_CODES.RISK_EVAL_REQUIRED,
      },
    };
  }

  return { ok: true, enforce: true, evaluation };
}

export function getEvaluationRecord(id: string): ReturnType<typeof getRiskEvaluationById> {
  return getRiskEvaluationById(id);
}
