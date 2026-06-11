import { test, afterEach } from "node:test";
import assert from "node:assert";
import {
  runCheckoutHoldCleanupOnce,
  startCheckoutHoldCleanupJob,
  stopCheckoutHoldCleanupJob,
} from "../jobs/checkout_hold_cleanup";
import {
  hasActiveCartHold,
  resetReservationLedgerForTests,
  reserveCartHold,
  seedOnHandSku,
} from "./reservation_ledger";

afterEach(() => {
  stopCheckoutHoldCleanupJob();
  resetReservationLedgerForTests();
});

test("cleanup removes holds past expires_at plus grace buffer", () => {
  seedOnHandSku("SKU-EXP", 2);
  const reserved = reserveCartHold({
    cartId: "cart-expired",
    lines: [{ sku: "SKU-EXP", qty: 1 }],
    correlationId: "corr-exp",
    organizationId: "org-acme-01",
    quoteVersion: 1,
    promoCodes: [],
    expiresAtOverride: "2020-01-01T00:00:00.000Z",
  });
  assert.strictEqual(reserved.ok, true);
  assert.strictEqual(hasActiveCartHold("cart-expired"), true);

  const removed = runCheckoutHoldCleanupOnce(Date.parse("2020-01-01T01:00:00.000Z"));
  assert.strictEqual(removed, 1);
  assert.strictEqual(hasActiveCartHold("cart-expired"), false);
});

test("cleanup job starts without throwing", () => {
  startCheckoutHoldCleanupJob();
  stopCheckoutHoldCleanupJob();
});
