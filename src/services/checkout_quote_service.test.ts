import { test } from "node:test";
import assert from "node:assert";
import { buildCheckoutQuote, evaluateCoupon } from "./checkout_quote_service";

test("buildCheckoutQuote returns $5 shipping for subtotal below threshold", () => {
  const quote = buildCheckoutQuote({
    subtotal: 10,
    correlationId: "00000000-0000-4000-8000-000000000001",
  });
  assert.strictEqual(quote.shipping_fee, 5);
  assert.ok(quote.tax > 0);
  assert.strictEqual(quote.quote_version, 1);
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

test("empty cart returns zeroed fees with valid quote_version", () => {
  const quote = buildCheckoutQuote({
    subtotal: 0,
    correlationId: "00000000-0000-4000-8000-000000000003",
  });
  assert.strictEqual(quote.shipping_fee, 0);
  assert.strictEqual(quote.tax, 0);
  assert.strictEqual(quote.discount_total, 0);
  assert.strictEqual(quote.quote_version, 1);
});

test("evaluateCoupon applies SAVE10 and increments version", () => {
  const applied = evaluateCoupon({
    code: "SAVE10",
    subtotal: 100,
    currentQuoteVersion: 1,
    correlationId: "00000000-0000-4000-8000-000000000004",
  });
  assert.strictEqual(applied.ok, true);
  assert.ok(applied.quote);
  assert.strictEqual(applied.quote.quote_version, 2);
  assert.ok(applied.quote.discount_total > 0);
});

test("evaluateCoupon rejects EXPIRED20", () => {
  const applied = evaluateCoupon({
    code: "EXPIRED20",
    subtotal: 100,
    currentQuoteVersion: 1,
    correlationId: "00000000-0000-4000-8000-000000000005",
  });
  assert.strictEqual(applied.ok, false);
  assert.strictEqual(applied.code, "COUPON_EXPIRED");
});

test("evaluateCoupon rejects MIN100 when subtotal too low", () => {
  const applied = evaluateCoupon({
    code: "MIN100",
    subtotal: 50,
    currentQuoteVersion: 1,
    correlationId: "00000000-0000-4000-8000-000000000006",
  });
  assert.strictEqual(applied.ok, false);
  assert.strictEqual(applied.code, "MIN_SPEND_NOT_MET");
});
