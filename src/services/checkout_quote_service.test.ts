import { test } from "node:test";
import assert from "node:assert";
import {
  buildCheckoutQuote,
  computeQuoteVersion,
  evaluateCoupon,
} from "./checkout_quote_service";
import { resetCheckoutMetricsForTests } from "./checkout_metrics";

test("buildCheckoutQuote returns non-zero shipping and tax below free-ship threshold", () => {
  const quote = buildCheckoutQuote({
    subtotal: 100,
    lines: [{ sku: "SKU-A", qty: 1 }],
    correlationId: "00000000-0000-4000-8000-000000000001",
  });
  assert.ok(quote.shipping_fee > 0);
  assert.ok(quote.tax > 0);
  assert.strictEqual(quote.quote_version.length, 64);
  assert.ok(quote.grand_total > quote.subtotal);
});

test("legacy mode returns zero fees", () => {
  const quote = buildCheckoutQuote({
    subtotal: 100,
    correlationId: "00000000-0000-4000-8000-000000000002",
    legacyMode: true,
  });
  assert.strictEqual(quote.shipping_fee, 0);
  assert.strictEqual(quote.tax, 0);
  assert.strictEqual(quote.grand_total, 100);
});

test("quote_version is stable for identical cart state", () => {
  const input = {
    lines: [{ sku: "B", qty: 2 }],
    shippingAddress: { city: "NYC" },
    promoCodes: ["SAVE10"],
    subtotal: 50,
  };
  assert.strictEqual(computeQuoteVersion(input), computeQuoteVersion(input));
});

test("evaluateCoupon applies SAVE10 and changes version", () => {
  resetCheckoutMetricsForTests();
  const base = buildCheckoutQuote({
    subtotal: 100,
    correlationId: "00000000-0000-4000-8000-000000000003",
  });
  const applied = evaluateCoupon({
    code: "SAVE10",
    subtotal: 100,
    currentQuoteVersion: base.quote_version,
    correlationId: "00000000-0000-4000-8000-000000000004",
  });
  assert.strictEqual(applied.applied, true);
  assert.ok(applied.quote);
  assert.ok(applied.quote.grand_total < base.grand_total);
  assert.notStrictEqual(applied.quote.quote_version, base.quote_version);
});

test("evaluateCoupon rejects EXPIRED20", () => {
  resetCheckoutMetricsForTests();
  const base = buildCheckoutQuote({
    subtotal: 100,
    correlationId: "00000000-0000-4000-8000-000000000005",
  });
  const applied = evaluateCoupon({
    code: "EXPIRED20",
    subtotal: 100,
    currentQuoteVersion: base.quote_version,
    correlationId: "00000000-0000-4000-8000-000000000006",
  });
  assert.strictEqual(applied.applied, false);
  assert.strictEqual(applied.reason, "COUPON_EXPIRED");
});
