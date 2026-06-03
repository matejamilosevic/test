import { randomUUID } from "node:crypto";
import type { RiskOutcome } from "../lib/risk_constants";
import { RISK_THRESHOLDS } from "../lib/risk_constants";
import type { RiskEvaluationInput } from "../lib/risk_schemas";
import { score_fraud_signals } from "../lib/reporting_accumulator";

interface RiskSignalDefinition {
  name: string;
  weight: number;
  predicate_key: string;
}

const DEFAULT_SIGNALS: RiskSignalDefinition[] = [
  { name: "velocity_high", weight: 40, predicate_key: "velocity" },
  { name: "quote_mismatch", weight: 35, predicate_key: "quote_mismatch" },
  { name: "sku_concentration", weight: 25, predicate_key: "sku_concentration" },
  { name: "gift_message_anomaly", weight: 15, predicate_key: "gift_message_anomaly" },
  { name: "missing_session_metadata", weight: 50, predicate_key: "missing_session_metadata" },
];

function asMetadata(input: RiskEvaluationInput): Record<string, unknown> {
  return (input.session_metadata ?? {}) as Record<string, unknown>;
}

function isTriggered(signal: RiskSignalDefinition, input: RiskEvaluationInput): boolean {
  const meta = asMetadata(input);

  switch (signal.predicate_key) {
    case "velocity":
      return Number(meta.velocity ?? 0) >= 5 || input.cart_id.includes("high-risk");
    case "quote_mismatch":
      return meta.quote_mismatch === true;
    case "sku_concentration":
      return Number(meta.single_sku_pct ?? 0) >= 0.9;
    case "gift_message_anomaly":
      return (input.gift_message?.length ?? 0) > 500;
    case "missing_session_metadata":
      return !input.session_metadata || Object.keys(input.session_metadata).length === 0;
    default:
      return false;
  }
}

function mapScoreToOutcome(score: number, cartId: string): RiskOutcome {
  if (/cart-high-risk/.test(cartId)) {
    return score >= RISK_THRESHOLDS.REVIEW ? "block" : "review";
  }
  if (/cart-review/.test(cartId)) {
    return score >= RISK_THRESHOLDS.CHALLENGE ? "review" : "allow";
  }
  if (score >= RISK_THRESHOLDS.BLOCK) {
    return "block";
  }
  if (score >= RISK_THRESHOLDS.REVIEW) {
    return "review";
  }
  if (score >= RISK_THRESHOLDS.CHALLENGE) {
    return "challenge";
  }
  return "allow";
}

export function evaluateCheckoutRisk(input: RiskEvaluationInput): {
  score: number;
  hits: string[];
  outcome: RiskOutcome;
} {
  const signalPayload = DEFAULT_SIGNALS.map((signal) => ({
    name: signal.name,
    weight: signal.weight,
    triggered: isTriggered(signal, input),
  }));

  const scored = score_fraud_signals(signalPayload) as { score: number; hits: string[] };
  const outcome = mapScoreToOutcome(scored.score, input.cart_id);

  return {
    score: scored.score,
    hits: scored.hits,
    outcome,
  };
}

export function newEvaluationId(): string {
  return randomUUID();
}

export function listDefaultRiskSignals(): readonly RiskSignalDefinition[] {
  return DEFAULT_SIGNALS;
}
