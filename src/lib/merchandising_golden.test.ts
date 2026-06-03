import { test, afterEach } from "node:test";
import assert from "node:assert";
import {
  resetMerchandisingFactsForTests,
  ingestMerchandisingFact,
  computeMerchandisingRollup,
  computeMerchandisingRollupStreamed,
} from "../services/merchandising_facts_store";
import { batchReduceMerchandisingFacts, streamReduceMerchandisingFacts } from "../lib/merchandising_accumulator";
import type { MerchandisingFact } from "../lib/merchandising_types";
import { ingestRefundFacts } from "../services/merchandising_checkout_ingest";
import { reconcileMerchandisingToLegacy } from "../lib/merchandising_reconcile";

function baseFact(overrides: Partial<MerchandisingFact> & Pick<MerchandisingFact, "sourceId" | "lineId" | "eventType" | "category" | "amountMinor">): MerchandisingFact {
  return {
    source: "test",
    channel: "web",
    currency: "USD",
    taxBucket: "standard",
    correlationId: "corr-1",
    occurredAt: "2026-05-06T10:00:00.000Z",
    ...overrides,
  };
}

afterEach(() => {
  resetMerchandisingFactsForTests();
});

test("golden: simple sale", () => {
  ingestMerchandisingFact(
    baseFact({ sourceId: "o1", lineId: "L1", eventType: "sale_line", category: "gmv", amountMinor: 5000 }),
  );
  const r = computeMerchandisingRollup({ asOfIso: "2026-05-06T12:00:00.000Z", currency: "USD" });
  assert.strictEqual(r.gmvMinor, 5000);
  assert.strictEqual(r.netRevenueMinor, 5000);
});

test("golden: multi-line with discount", () => {
  ingestMerchandisingFact(
    baseFact({ sourceId: "o2", lineId: "L1", eventType: "sale_line", category: "gmv", amountMinor: 3000 }),
  );
  ingestMerchandisingFact(
    baseFact({ sourceId: "o2", lineId: "L2", eventType: "sale_line", category: "gmv", amountMinor: 2000 }),
  );
  ingestMerchandisingFact(
    baseFact({
      sourceId: "o2",
      lineId: "order:discount",
      eventType: "manual_adjustment",
      category: "discount",
      amountMinor: 500,
    }),
  );
  const r = computeMerchandisingRollup({ asOfIso: "2026-05-06T12:00:00.000Z", currency: "USD" });
  assert.strictEqual(r.gmvMinor, 5000);
  assert.strictEqual(r.discountMinor, 500);
  assert.strictEqual(r.netRevenueMinor, 4500);
});

test("golden: partial refund", () => {
  ingestMerchandisingFact(
    baseFact({ sourceId: "o3", lineId: "L1", eventType: "sale_line", category: "gmv", amountMinor: 10_000 }),
  );
  ingestRefundFacts({
    orderRef: "o3",
    correlationId: "c-2",
    occurredAt: "2026-05-06T11:00:00.000Z",
    currency: "USD",
    channel: "web",
    refundMinor: 3000,
    lineId: "R1",
  });
  const r = computeMerchandisingRollup({ asOfIso: "2026-05-06T12:00:00.000Z", currency: "USD" });
  assert.strictEqual(r.refundMinor, 3000);
  assert.strictEqual(r.netRevenueMinor, 7000);
});

test("golden: full return clears net to shipping-only scenario", () => {
  ingestMerchandisingFact(
    baseFact({ sourceId: "o4", lineId: "L1", eventType: "sale_line", category: "gmv", amountMinor: 8000 }),
  );
  ingestMerchandisingFact(
    baseFact({
      sourceId: "o4",
      lineId: "order:ship",
      eventType: "shipping_surcharge",
      category: "shipping",
      amountMinor: 500,
      taxBucket: "zero",
    }),
  );
  ingestRefundFacts({
    orderRef: "o4",
    correlationId: "c-3",
    occurredAt: "2026-05-06T11:00:00.000Z",
    currency: "USD",
    channel: "web",
    refundMinor: 8000,
    lineId: "R-full",
  });
  const r = computeMerchandisingRollup({ asOfIso: "2026-05-06T12:00:00.000Z", currency: "USD" });
  assert.strictEqual(r.netRevenueMinor, 500);
});

test("golden: shipping surcharge", () => {
  ingestMerchandisingFact(
      baseFact({ sourceId: "o5", lineId: "L1", eventType: "sale_line", category: "gmv", amountMinor: 1000 }),
  );
  ingestMerchandisingFact(
    baseFact({
      sourceId: "o5",
      lineId: "order:shipping",
      eventType: "shipping_surcharge",
      category: "shipping",
      amountMinor: 250,
      taxBucket: "zero",
    }),
  );
  const r = computeMerchandisingRollup({ asOfIso: "2026-05-06T12:00:00.000Z", currency: "USD" });
  assert.strictEqual(r.netRevenueMinor, 1250);
});

test("golden: tax-inclusive adjustment", () => {
  ingestMerchandisingFact(
    baseFact({ sourceId: "o6", lineId: "L1", eventType: "sale_line", category: "gmv", amountMinor: 2000 }),
  );
  ingestMerchandisingFact(
    baseFact({
      sourceId: "o6",
      lineId: "order:tax_inclusive",
      eventType: "tax_inclusive_adjustment",
      category: "tax",
      amountMinor: 400,
    }),
  );
  const r = computeMerchandisingRollup({ asOfIso: "2026-05-06T12:00:00.000Z", currency: "USD" });
  assert.strictEqual(r.taxMinor, 400);
});

test("golden: currency filter (EUR roll-up excludes USD facts)", () => {
  ingestMerchandisingFact(
    baseFact({
      sourceId: "o7",
      lineId: "L1",
      eventType: "sale_line",
      category: "gmv",
      amountMinor: 100,
      currency: "EUR",
    }),
  );
  ingestMerchandisingFact(
    baseFact({
      sourceId: "o8",
      lineId: "L1",
      eventType: "sale_line",
      category: "gmv",
      amountMinor: 999,
      currency: "USD",
    }),
  );
  const eur = computeMerchandisingRollup({ asOfIso: "2026-05-06T12:00:00.000Z", currency: "EUR" });
  const usd = computeMerchandisingRollup({ asOfIso: "2026-05-06T12:00:00.000Z", currency: "USD" });
  assert.strictEqual(eur.gmvMinor, 100);
  assert.strictEqual(usd.gmvMinor, 999);
});

test("golden: duplicate ingest is idempotent", () => {
  const f = baseFact({ sourceId: "o9", lineId: "L1", eventType: "sale_line", category: "gmv", amountMinor: 100 });
  const a = ingestMerchandisingFact(f);
  const b = ingestMerchandisingFact({ ...f, amountMinor: 999 });
  assert.strictEqual(a.inserted, true);
  assert.strictEqual(b.inserted, false);
  const r = computeMerchandisingRollup({ asOfIso: "2026-05-06T12:00:00.000Z", currency: "USD" });
  assert.strictEqual(r.gmvMinor, 100);
});

test("batch vs stream reduces match on shuffled facts", () => {
  const facts: MerchandisingFact[] = [
    baseFact({ sourceId: "p1", lineId: "a", eventType: "sale_line", category: "gmv", amountMinor: 1, occurredAt: "2026-05-06T09:00:00.000Z" }),
    baseFact({ sourceId: "p1", lineId: "b", eventType: "sale_line", category: "gmv", amountMinor: 2, occurredAt: "2026-05-06T08:00:00.000Z" }),
    baseFact({
      sourceId: "p1",
      lineId: "d",
      eventType: "manual_adjustment",
      category: "discount",
      amountMinor: 1,
      occurredAt: "2026-05-06T07:00:00.000Z",
    }),
  ];
  const shuffled = [facts[1], facts[2], facts[0]];
  const batch = batchReduceMerchandisingFacts(shuffled, "2026-05-06T12:00:00.000Z", "USD");
  const streamed = streamReduceMerchandisingFacts(shuffled, "2026-05-06T12:00:00.000Z", "USD");
  assert.deepStrictEqual(batch, streamed);
});

test("as_of excludes facts after cutoff", () => {
  ingestMerchandisingFact(
    baseFact({
      sourceId: "late",
      lineId: "L1",
      eventType: "sale_line",
      category: "gmv",
      amountMinor: 50,
      occurredAt: "2026-05-06T20:00:00.000Z",
    }),
  );
  ingestMerchandisingFact(
    baseFact({
      sourceId: "early",
      lineId: "L1",
      eventType: "sale_line",
      category: "gmv",
      amountMinor: 25,
      occurredAt: "2026-05-06T10:00:00.000Z",
    }),
  );
  const r = computeMerchandisingRollup({ asOfIso: "2026-05-06T12:00:00.000Z", currency: "USD" });
  assert.strictEqual(r.gmvMinor, 25);
});

test("batch rollup vs streamed rollup from store match", () => {
  ingestMerchandisingFact(
    baseFact({ sourceId: "o10", lineId: "L1", eventType: "sale_line", category: "gmv", amountMinor: 7 }),
  );
  const batch = computeMerchandisingRollup({ asOfIso: "2026-05-06T12:00:00.000Z", currency: "USD" });
  const stream = computeMerchandisingRollupStreamed({ asOfIso: "2026-05-06T12:00:00.000Z", currency: "USD" });
  assert.deepStrictEqual(batch, stream);
});

test("reconciliation report flags breach outside tolerance", () => {
  const rollup = computeMerchandisingRollup({ asOfIso: "2026-05-06T12:00:00.000Z", currency: "USD" });
  const report = reconcileMerchandisingToLegacy({
    rollup: { ...rollup, netRevenueMinor: 100 },
    legacyNetMinor: 104,
    toleranceMinor: 2,
  });
  assert.strictEqual(report.ok, false);
  assert.ok(report.report.includes("breach"));
});
