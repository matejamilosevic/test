import { randomUUID } from "node:crypto";
import type { ReviewCaseStatus, RiskOutcome } from "../lib/risk_constants";
import { RISK_EVAL_CACHE_TTL_MS } from "../lib/risk_constants";
import type { RiskEvaluationInput } from "../lib/risk_schemas";
import { scrubRiskInput } from "./risk_scrubber";

export interface RiskEvaluationRecord {
  id: string;
  organizationId: string;
  cartId: string;
  quoteVersion: string;
  score: number;
  outcome: RiskOutcome;
  hits: string[];
  scrubbedInput: Record<string, unknown>;
  createdAt: string;
}

export interface RiskReviewCase {
  id: string;
  organizationId: string;
  evaluationId: string;
  cartId: string;
  status: ReviewCaseStatus;
  assignedTo?: string;
  overrideReason?: string;
  overrideToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskAuditEntry {
  action: string;
  actorId: string;
  caseId?: string;
  reason?: string;
  at: string;
}

interface CacheEntry {
  evaluationId: string;
  expiresAt: number;
}

interface OverrideTokenRecord {
  cartId: string;
  organizationId: string;
  used: boolean;
}

let riskState: {
  evaluations: Map<string, RiskEvaluationRecord>;
  cache: Map<string, CacheEntry>;
  reviewCases: Map<string, RiskReviewCase>;
  overrideTokens: Map<string, OverrideTokenRecord>;
  auditLog: RiskAuditEntry[];
  outcomeCounts: Map<RiskOutcome, number>;
  evalLatenciesMs: number[];
} = {
  evaluations: new Map(),
  cache: new Map(),
  reviewCases: new Map(),
  overrideTokens: new Map(),
  auditLog: [],
  outcomeCounts: new Map(),
  evalLatenciesMs: [],
};

function cacheKey(cartId: string, quoteVersion: string): string {
  return `${cartId}|${quoteVersion}`;
}

function isoNow(): string {
  return new Date().toISOString();
}

export function resetRiskStoreForTests(): void {
  riskState = {
    evaluations: new Map(),
    cache: new Map(),
    reviewCases: new Map(),
    overrideTokens: new Map(),
    auditLog: [],
    outcomeCounts: new Map(),
    evalLatenciesMs: [],
  };
}

export function persistRiskEvaluation(input: {
  organizationId: string;
  cartId: string;
  quoteVersion: string;
  score: number;
  outcome: RiskOutcome;
  hits: string[];
  rawInput: RiskEvaluationInput;
  latencyMs?: number;
}): RiskEvaluationRecord {
  const id = randomUUID();
  const record: RiskEvaluationRecord = {
    id,
    organizationId: input.organizationId,
    cartId: input.cartId,
    quoteVersion: input.quoteVersion,
    score: input.score,
    outcome: input.outcome,
    hits: input.hits,
    scrubbedInput: scrubRiskInput(input.rawInput as unknown as Record<string, unknown>),
    createdAt: isoNow(),
  };

  riskState.evaluations.set(id, record);
  riskState.cache.set(cacheKey(input.cartId, input.quoteVersion), {
    evaluationId: id,
    expiresAt: Date.now() + RISK_EVAL_CACHE_TTL_MS,
  });

  const prev = riskState.outcomeCounts.get(input.outcome) ?? 0;
  riskState.outcomeCounts.set(input.outcome, prev + 1);
  if (input.latencyMs !== undefined) {
    riskState.evalLatenciesMs.push(input.latencyMs);
  }

  return record;
}

export function getCachedEvaluation(cartId: string, quoteVersion: string): RiskEvaluationRecord | undefined {
  const cached = riskState.cache.get(cacheKey(cartId, quoteVersion));
  if (!cached) {
    return undefined;
  }
  if (cached.expiresAt < Date.now()) {
    riskState.cache.delete(cacheKey(cartId, quoteVersion));
    return undefined;
  }
  return riskState.evaluations.get(cached.evaluationId);
}

export function getRiskEvaluationById(id: string): RiskEvaluationRecord | undefined {
  return riskState.evaluations.get(id);
}

export function createReviewCase(input: {
  organizationId: string;
  evaluationId: string;
  cartId: string;
}): RiskReviewCase {
  const now = isoNow();
  const reviewCase: RiskReviewCase = {
    id: randomUUID(),
    organizationId: input.organizationId,
    evaluationId: input.evaluationId,
    cartId: input.cartId,
    status: "open",
    createdAt: now,
    updatedAt: now,
  };
  riskState.reviewCases.set(reviewCase.id, reviewCase);
  return reviewCase;
}

export function listReviewCases(organizationId: string): RiskReviewCase[] {
  return [...riskState.reviewCases.values()].filter((c) => c.organizationId === organizationId);
}

export function getReviewCase(caseId: string, organizationId: string): RiskReviewCase | undefined {
  const reviewCase = riskState.reviewCases.get(caseId);
  if (!reviewCase || reviewCase.organizationId !== organizationId) {
    return undefined;
  }
  return reviewCase;
}

export function applyRiskOverride(input: {
  caseId: string;
  organizationId: string;
  actorId: string;
  reason: string;
}): { reviewCase: RiskReviewCase; overrideToken: string } | undefined {
  const reviewCase = getReviewCase(input.caseId, input.organizationId);
  if (!reviewCase || reviewCase.status !== "open") {
    return undefined;
  }

  const overrideToken = randomUUID();
  reviewCase.status = "approved";
  reviewCase.overrideReason = input.reason;
  reviewCase.overrideToken = overrideToken;
  reviewCase.updatedAt = isoNow();
  riskState.reviewCases.set(reviewCase.id, reviewCase);
  riskState.overrideTokens.set(overrideToken, {
    cartId: reviewCase.cartId,
    organizationId: input.organizationId,
    used: false,
  });
  riskState.auditLog.push({
    action: "risk_override",
    actorId: input.actorId,
    caseId: reviewCase.id,
    reason: input.reason,
    at: isoNow(),
  });

  return { reviewCase, overrideToken };
}

export function consumeOverrideToken(token: string, cartId: string, organizationId: string): boolean {
  const record = riskState.overrideTokens.get(token);
  if (!record || record.used || record.cartId !== cartId || record.organizationId !== organizationId) {
    return false;
  }
  record.used = true;
  riskState.overrideTokens.set(token, record);
  return true;
}

export function listRiskAuditLog(): readonly RiskAuditEntry[] {
  return riskState.auditLog;
}

export function getRiskMetrics(): {
  risk_outcome_count: Record<RiskOutcome, number>;
  risk_eval_latency_ms: number[];
  risk_review_queue_size: number;
} {
  const outcomeCount: Record<RiskOutcome, number> = {
    allow: riskState.outcomeCounts.get("allow") ?? 0,
    challenge: riskState.outcomeCounts.get("challenge") ?? 0,
    review: riskState.outcomeCounts.get("review") ?? 0,
    block: riskState.outcomeCounts.get("block") ?? 0,
  };
  const openCases = [...riskState.reviewCases.values()].filter((c) => c.status === "open").length;
  return {
    risk_outcome_count: outcomeCount,
    risk_eval_latency_ms: [...riskState.evalLatenciesMs],
    risk_review_queue_size: openCases,
  };
}

export function listRiskEvaluationsForOrganization(organizationId: string): RiskEvaluationRecord[] {
  return [...riskState.evaluations.values()].filter((e) => e.organizationId === organizationId);
}
