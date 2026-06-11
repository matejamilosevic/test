import type { CommitCartHoldResult, ReserveCartHoldResult } from "../services/reservation_ledger";
import type { resolveRiskGateForSubmit } from "./risk_routes";

export type RiskGateSubmitResult = ReturnType<typeof resolveRiskGateForSubmit>;

export function isRiskGateFailure(
  gate: RiskGateSubmitResult,
): gate is { ok: false; status: number; body: Record<string, unknown> } {
  return (
    gate.ok === false &&
    typeof gate.status === "number" &&
    gate.body !== null &&
    typeof gate.body === "object"
  );
}

export function isCommitFailure(
  result: CommitCartHoldResult,
): result is Extract<CommitCartHoldResult, { ok: false }> {
  return (
    result.ok === false &&
    (result.code === "NO_ACTIVE_HOLD" ||
      result.code === "INSUFFICIENT_STOCK" ||
      result.code === "QUOTE_STALE" ||
      result.code === "HOLD_EXPIRED")
  );
}

export function isReserveFailure(
  result: ReserveCartHoldResult,
): result is Extract<ReserveCartHoldResult, { ok: false }> {
  return result.ok === false && result.code === "INSUFFICIENT_STOCK" && typeof result.skuId === "string";
}

export const CHECKOUT_INTERNAL_ERROR_BODY = {
  error: "Internal error",
  code: "INTERNAL_ERROR",
} as const;
