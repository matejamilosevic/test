import { test } from "node:test";
import assert from "node:assert";
import { isCommitFailure, isReserveFailure, isRiskGateFailure } from "./checkout_unions";
import type { CommitCartHoldResult, ReserveCartHoldResult } from "../services/reservation_ledger";

test("isRiskGateFailure accepts well-formed failure variant", () => {
  const gate = { ok: false as const, status: 400, body: { code: "RISK_EVAL_REQUIRED" } };
  assert.strictEqual(isRiskGateFailure(gate), true);
});

test("isRiskGateFailure rejects malformed failure without status", () => {
  const gate = { ok: false as const, body: { code: "X" } };
  assert.strictEqual(isRiskGateFailure(gate as unknown as Parameters<typeof isRiskGateFailure>[0]), false);
});

test("isCommitFailure accepts NO_ACTIVE_HOLD and INSUFFICIENT_STOCK", () => {
  assert.strictEqual(isCommitFailure({ ok: false, code: "NO_ACTIVE_HOLD" }), true);
  assert.strictEqual(isCommitFailure({ ok: false, code: "INSUFFICIENT_STOCK", skuId: "SKU-1" }), true);
});

test("isCommitFailure rejects success shape", () => {
  const ok: CommitCartHoldResult = { ok: true, correlationId: "c", orderRef: "o" };
  assert.strictEqual(isCommitFailure(ok), false);
});

test("isReserveFailure accepts INSUFFICIENT_STOCK with skuId", () => {
  const fail: ReserveCartHoldResult = { ok: false, code: "INSUFFICIENT_STOCK", skuId: "SKU-1" };
  assert.strictEqual(isReserveFailure(fail), true);
});

test("isReserveFailure rejects malformed failure", () => {
  const malformed = { ok: false, code: "INSUFFICIENT_STOCK" } as ReserveCartHoldResult;
  assert.strictEqual(isReserveFailure(malformed), false);
});
