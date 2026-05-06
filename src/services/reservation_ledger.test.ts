import { test, afterEach } from "node:test";
import assert from "node:assert";
import {
  commitCartHold,
  getAvailableToPromise,
  newCorrelationId,
  releaseCartHold,
  reserveCartHold,
  resetReservationLedgerForTests,
  seedOnHandSku,
} from "./reservation_ledger";

afterEach(() => {
  resetReservationLedgerForTests();
});

test("reserve and commit reduces on-hand and clears hold", () => {
  seedOnHandSku("SKU-A", 5);
  const cid = newCorrelationId();
  const r1 = reserveCartHold({
    cartId: "cart-1",
    lines: [{ sku: "SKU-A", qty: 2 }],
    correlationId: cid,
  });
  assert.strictEqual(r1.ok, true);
  assert.strictEqual(getAvailableToPromise("SKU-A"), 3);

  const c = commitCartHold({
    cartId: "cart-1",
    orderRef: "order-1",
    correlationId: newCorrelationId(),
  });
  assert.strictEqual(c.ok, true);
  assert.strictEqual(getAvailableToPromise("SKU-A"), 3);
});

test("two carts cannot oversubscribe last unit", () => {
  seedOnHandSku("SKU-B", 1);
  const ok1 = reserveCartHold({
    cartId: "c1",
    lines: [{ sku: "SKU-B", qty: 1 }],
    correlationId: newCorrelationId(),
  });
  assert.strictEqual(ok1.ok, true);
  const bad = reserveCartHold({
    cartId: "c2",
    lines: [{ sku: "SKU-B", qty: 1 }],
    correlationId: newCorrelationId(),
  });
  assert.strictEqual(bad.ok, false);
  if (!bad.ok) {
    assert.strictEqual(bad.code, "INSUFFICIENT_STOCK");
  }
});

test("refreshing hold releases previous delta before validating", () => {
  seedOnHandSku("SKU-C", 2);
  reserveCartHold({
    cartId: "cx",
    lines: [{ sku: "SKU-C", qty: 2 }],
    correlationId: newCorrelationId(),
  });
  const again = reserveCartHold({
    cartId: "cx",
    lines: [{ sku: "SKU-C", qty: 1 }],
    correlationId: newCorrelationId(),
  });
  assert.strictEqual(again.ok, true);
  assert.strictEqual(getAvailableToPromise("SKU-C"), 1);
});

test("release clears reservation without touching on-hand", () => {
  seedOnHandSku("SKU-D", 3);
  reserveCartHold({
    cartId: "cd",
    lines: [{ sku: "SKU-D", qty: 2 }],
    correlationId: newCorrelationId(),
  });
  assert.strictEqual(getAvailableToPromise("SKU-D"), 1);
  releaseCartHold({ cartId: "cd", correlationId: newCorrelationId() });
  assert.strictEqual(getAvailableToPromise("SKU-D"), 3);
});
