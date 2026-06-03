import { test, afterEach } from "node:test";
import assert from "node:assert";
import { evaluateCheckoutRisk } from "./risk_engine";
import { scrubRiskInput, containsPan } from "./risk_scrubber";
import {
  getCachedEvaluation,
  getRiskEvaluationById,
  persistRiskEvaluation,
  resetRiskStoreForTests,
} from "./risk_store";

afterEach(() => {
  resetRiskStoreForTests();
});

test("high velocity signals map to block outcome", () => {
  const result = evaluateCheckoutRisk({
    organization_id: "org-acme-01",
    cart_id: "cart-high-risk-02",
    quote_version: "quote-v1",
    session_metadata: { velocity: 8, quote_mismatch: true },
  });
  assert.strictEqual(result.outcome, "block");
  assert.ok(result.score >= 40);
});

test("low risk cart maps to allow outcome", () => {
  const result = evaluateCheckoutRisk({
    organization_id: "org-acme-01",
    cart_id: "cart-happy-01",
    quote_version: "quote-v1",
    session_metadata: { velocity: 0 },
  });
  assert.strictEqual(result.outcome, "allow");
});

test("review band for review fixture cart", () => {
  const result = evaluateCheckoutRisk({
    organization_id: "org-acme-01",
    cart_id: "cart-review-03",
    quote_version: "quote-v1",
    session_metadata: { velocity: 2, single_sku_pct: 0.95 },
  });
  assert.strictEqual(result.outcome, "review");
});

test("quote mismatch contributes to elevated score", () => {
  const result = evaluateCheckoutRisk({
    organization_id: "org-acme-01",
    cart_id: "cart-mismatch",
    quote_version: "quote-v1",
    session_metadata: { quote_mismatch: true, velocity: 1 },
  });
  assert.ok(result.hits.includes("quote_mismatch"));
  assert.ok(result.score >= 35);
});

test("gift message anomaly triggers hit", () => {
  const result = evaluateCheckoutRisk({
    organization_id: "org-acme-01",
    cart_id: "cart-gift",
    quote_version: "quote-v1",
    session_metadata: { velocity: 0 },
    gift_message: "x".repeat(600),
  });
  assert.ok(result.hits.includes("gift_message_anomaly"));
});

test("missing session metadata triggers elevated score", () => {
  const result = evaluateCheckoutRisk({
    organization_id: "org-acme-01",
    cart_id: "cart-empty-meta",
    quote_version: "quote-v1",
  });
  assert.ok(result.hits.includes("missing_session_metadata"));
  assert.strictEqual(result.outcome, "review");
});

test("scrubber redacts PAN from payment metadata", () => {
  const scrubbed = scrubRiskInput({
    organization_id: "org-acme-01",
    cart_id: "cart-1",
    quote_version: "q1",
    session_metadata: { note: "card 4111111111111111" },
    gift_message: "happy birthday",
  });
  const meta = scrubbed.session_metadata as Record<string, unknown>;
  assert.ok(!String(meta.note).includes("4111"));
  assert.strictEqual(scrubbed.gift_message, "[REDACTED_GIFT_MESSAGE]");
});

test("persisted evaluation scrubs PAN from stored input", () => {
  const record = persistRiskEvaluation({
    organizationId: "org-acme-01",
    cartId: "cart-1",
    quoteVersion: "quote-v1",
    score: 10,
    outcome: "allow",
    hits: [],
    rawInput: {
      organization_id: "org-acme-01",
      cart_id: "cart-1",
      quote_version: "quote-v1",
      payment_method: "4111111111111111",
    },
  });
  assert.ok(!JSON.stringify(record.scrubbedInput).includes("4111"));
});

test("evaluation cache keyed by cart and quote version", () => {
  persistRiskEvaluation({
    organizationId: "org-acme-01",
    cartId: "cart-happy-01",
    quoteVersion: "quote-v1",
    score: 0,
    outcome: "allow",
    hits: [],
    rawInput: {
      organization_id: "org-acme-01",
      cart_id: "cart-happy-01",
      quote_version: "quote-v1",
      session_metadata: { velocity: 0 },
    },
  });
  const cached = getCachedEvaluation("cart-happy-01", "quote-v1");
  assert.ok(cached);
  assert.strictEqual(getCachedEvaluation("cart-happy-01", "quote-v2"), undefined);
});

test("golden scoring scenarios cover major bands", () => {
  const scenarios = [
    { cart_id: "cart-high-risk-02", meta: { velocity: 10 }, outcome: "block" },
    { cart_id: "cart-review-03", meta: { single_sku_pct: 0.95 }, outcome: "review" },
    { cart_id: "cart-happy-01", meta: { velocity: 0 }, outcome: "allow" },
    { cart_id: "cart-challenge", meta: { velocity: 3, quote_mismatch: true }, outcome: "challenge" },
  ] as const;

  for (const scenario of scenarios) {
    const result = evaluateCheckoutRisk({
      organization_id: "org-acme-01",
      cart_id: scenario.cart_id,
      quote_version: "quote-v1",
      session_metadata: scenario.meta,
    });
    assert.strictEqual(result.outcome, scenario.outcome, scenario.cart_id);
  }
});

test("containsPan detects primary account numbers", () => {
  assert.strictEqual(containsPan("4111111111111111"), true);
  assert.strictEqual(containsPan("no card here"), false);
});

test("evaluation record retrievable by id", () => {
  const record = persistRiskEvaluation({
    organizationId: "org-acme-01",
    cartId: "cart-1",
    quoteVersion: "quote-v1",
    score: 1,
    outcome: "allow",
    hits: [],
    rawInput: {
      organization_id: "org-acme-01",
      cart_id: "cart-1",
      quote_version: "quote-v1",
    },
  });
  assert.strictEqual(getRiskEvaluationById(record.id)?.id, record.id);
});
