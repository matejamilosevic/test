export const RISK_ERROR_CODES = {
  RISK_DECLINED: "RISK_DECLINED",
  RISK_EVAL_REQUIRED: "RISK_EVAL_REQUIRED",
} as const;

export const FEATURE_GATES = {
  RISK_GATE_ENABLED: "checkout.risk_gate_enabled",
  RISK_SHADOW_MODE: "checkout.risk_shadow_mode",
  RISK_FAIL_OPEN: "checkout.risk_fail_open",
} as const;

export const RISK_THRESHOLDS = {
  BLOCK: 70,
  REVIEW: 40,
  CHALLENGE: 25,
} as const;

export const RISK_EVAL_CACHE_TTL_MS = 15 * 60 * 1000;

export type RiskOutcome = "allow" | "challenge" | "review" | "block";

export type ReviewCaseStatus = "open" | "approved" | "rejected";
