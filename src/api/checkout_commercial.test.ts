import { test, afterEach } from "node:test";
import assert from "node:assert";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  handle_checkout_preflight,
  handle_checkout_submit,
  handle_coupon_apply,
  handle_checkout_release,
} from "./checkout_routes";
import { resetCheckoutConfigForTests, setCheckoutConfigForTests } from "../lib/checkout_config";
import { getCheckoutMetrics, resetCheckoutMetricsForTests } from "../services/checkout_metrics";
import {
  hasActiveCartHold,
  resetReservationLedgerForTests,
  seedOnHandSku,
} from "../services/reservation_ledger";

const ACME_AUTH = { authorization: "Bearer org-acme-01:alice@acme.com" };
const GLOBEX_AUTH = { authorization: "Bearer org-globex-02:charlie@globex.com" };

function mockInboundJson(body: unknown, headers: Record<string, string> = {}): IncomingMessage {
  const buf = Buffer.from(JSON.stringify(body), "utf8");
  const r = new Readable({
    read() {
      this.push(buf);
      this.push(null);
    },
  }) as IncomingMessage;
  r.url = "/";
  r.headers = headers;
  return r;
}

function captureResponse(): { res: ServerResponse; finished: Promise<{ status: number; body: string }> } {
  let resolve!: (v: { status: number; body: string }) => void;
  const finished = new Promise<{ status: number; body: string }>((r) => {
    resolve = r;
  });
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    setHeader(name: string, value: string) {
      this.headers[name.toLowerCase()] = value;
    },
    end(body?: string) {
      resolve({ status: this.statusCode, body: body ?? "" });
    },
  } as unknown as ServerResponse;
  return { res, finished };
}

afterEach(() => {
  resetReservationLedgerForTests();
  resetCheckoutConfigForTests();
  resetCheckoutMetricsForTests();
});

test("preflight with shipping fee applied", async () => {
  seedOnHandSku("item-cheap", 5);
  const { res, finished } = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      {
        subtotal: 10,
        cart_id: "cart-cheap",
        lines: [{ sku: "item-cheap", qty: 1 }],
      },
      ACME_AUTH,
    ),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 200);
  const json = JSON.parse(out.body) as {
    shipping_fee: number;
    quote_version: number;
    correlation_id: string;
  };
  assert.strictEqual(json.shipping_fee, 5);
  assert.strictEqual(json.quote_version, 1);
  assert.ok(json.correlation_id.length > 0);
});

test("apply valid coupon increments version", async () => {
  seedOnHandSku("SKU-C", 2);
  const pre = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      { cart_id: "cart-coupon", subtotal: 100, lines: [{ sku: "SKU-C", qty: 1 }] },
      ACME_AUTH,
    ),
    pre.res,
  );
  const preOut = JSON.parse((await pre.finished).body) as { quote_version: number };

  const coupon = captureResponse();
  await handle_coupon_apply(
    mockInboundJson(
      { cart_id: "cart-coupon", code: "SAVE10", subtotal: 100 },
      ACME_AUTH,
    ),
    coupon.res,
  );
  const couponOut = await coupon.finished;
  assert.strictEqual(couponOut.status, 200);
  const json = JSON.parse(couponOut.body) as {
    quote_version: number;
    discount_total: number;
  };
  assert.strictEqual(json.quote_version, 2);
  assert.ok(json.discount_total > 0);
});

test("apply expired coupon returns error", async () => {
  const { res, finished } = captureResponse();
  await handle_coupon_apply(
    mockInboundJson(
      { cart_id: "cart-expired", code: "EXPIRED20", subtotal: 100 },
      ACME_AUTH,
    ),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 422);
  const json = JSON.parse(out.body) as { code: string };
  assert.strictEqual(json.code, "COUPON_EXPIRED");
});

test("idempotent hold release", async () => {
  seedOnHandSku("SKU-R", 2);
  const pre = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      { cart_id: "cart-release", subtotal: 50, lines: [{ sku: "SKU-R", qty: 1 }] },
      ACME_AUTH,
    ),
    pre.res,
  );
  const holdId = (JSON.parse((await pre.finished).body) as { hold_id: string }).hold_id;

  const rel1 = captureResponse();
  await handle_checkout_release(mockInboundJson({ hold_id: holdId }, ACME_AUTH), rel1.res);
  assert.strictEqual((await rel1.finished).status, 204);

  const rel2 = captureResponse();
  await handle_checkout_release(mockInboundJson({ hold_id: holdId }, ACME_AUTH), rel2.res);
  assert.strictEqual((await rel2.finished).status, 204);
});

test("reject stale quote version", async () => {
  seedOnHandSku("SKU-S", 2);
  const pre = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      { cart_id: "cart-stale", subtotal: 100, lines: [{ sku: "SKU-S", qty: 1 }] },
      ACME_AUTH,
    ),
    pre.res,
  );
  const preJson = JSON.parse((await pre.finished).body) as { quote_version: number };

  const coupon = captureResponse();
  await handle_coupon_apply(
    mockInboundJson(
      { cart_id: "cart-stale", code: "SAVE10", subtotal: 100 },
      ACME_AUTH,
    ),
    coupon.res,
  );
  await coupon.finished;

  const submit = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-stale",
      payment_method: "card",
      quote_version: preJson.quote_version,
    }),
    submit.res,
  );
  const submitOut = await submit.finished;
  assert.strictEqual(submitOut.status, 409);
  const json = JSON.parse(submitOut.body) as { code: string };
  assert.strictEqual(json.code, "QUOTE_STALE");
});

test("unauthenticated preflight denied", async () => {
  const { res, finished } = captureResponse();
  await handle_checkout_preflight(mockInboundJson({ subtotal: 10 }), res);
  assert.strictEqual((await finished).status, 401);
});

test("cross-org hold release denied", async () => {
  seedOnHandSku("SKU-T", 1);
  const pre = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      { cart_id: "cart-tenant", subtotal: 20, lines: [{ sku: "SKU-T", qty: 1 }] },
      ACME_AUTH,
    ),
    pre.res,
  );
  const holdId = (JSON.parse((await pre.finished).body) as { hold_id: string }).hold_id;

  const rel = captureResponse();
  await handle_checkout_release(mockInboundJson({ hold_id: holdId }, GLOBEX_AUTH), rel.res);
  assert.strictEqual((await rel.finished).status, 403);
});

test("legacy behavior when gate is off", async () => {
  setCheckoutConfigForTests({ commercialPipelineEnabled: false });
  const { res, finished } = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson({ subtotal: 100 }, ACME_AUTH),
    res,
  );
  const json = JSON.parse((await finished).body) as { shipping_fee: number; tax: number };
  assert.strictEqual(json.shipping_fee, 0);
  assert.strictEqual(json.tax, 0);
});

test("full checkout journey rehearsal", async () => {
  seedOnHandSku("SKU-J", 3);
  const pre = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      { cart_id: "cart-journey", subtotal: 120, lines: [{ sku: "SKU-J", qty: 1 }] },
      ACME_AUTH,
    ),
    pre.res,
  );
  const preJson = JSON.parse((await pre.finished).body) as { quote_version: number; hold_id: string };

  const coupon = captureResponse();
  await handle_coupon_apply(
    mockInboundJson(
      { cart_id: "cart-journey", code: "SAVE10", subtotal: 120 },
      ACME_AUTH,
    ),
    coupon.res,
  );
  const couponJson = JSON.parse((await coupon.finished).body) as { quote_version: number };

  const rel = captureResponse();
  await handle_checkout_release(mockInboundJson({ hold_id: preJson.hold_id }, ACME_AUTH), rel.res);
  assert.strictEqual((await rel.finished).status, 204);
  assert.strictEqual(hasActiveCartHold("cart-journey"), false);

  const pre2 = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      { cart_id: "cart-journey", subtotal: 120, lines: [{ sku: "SKU-J", qty: 1 }] },
      ACME_AUTH,
    ),
    pre2.res,
  );
  await pre2.finished;

  const coupon2 = captureResponse();
  await handle_coupon_apply(
    mockInboundJson(
      { cart_id: "cart-journey", code: "SAVE10", subtotal: 120 },
      ACME_AUTH,
    ),
    coupon2.res,
  );
  const coupon2Json = JSON.parse((await coupon2.finished).body) as { quote_version: number };

  const submit = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-journey",
      payment_method: "card",
      quote_version: coupon2Json.quote_version,
    }),
    submit.res,
  );
  assert.strictEqual((await submit.finished).status, 200);
  assert.strictEqual(preJson.quote_version, 1);
  assert.strictEqual(couponJson.quote_version, 2);
});

test("latency tracking on coupon apply", async () => {
  const { res, finished } = captureResponse();
  await handle_coupon_apply(
    mockInboundJson({ cart_id: "cart-latency", code: "SAVE10", subtotal: 50 }, ACME_AUTH),
    res,
  );
  await finished;
  const metrics = getCheckoutMetrics();
  assert.ok(metrics.checkout_quote_latency_samples.length >= 1);
});
