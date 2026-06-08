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
import {
  resetCheckoutConfigForTests,
  setCheckoutConfigForTests,
} from "../lib/checkout_config";
import {
  getCheckoutMetrics,
  resetCheckoutMetricsForTests,
} from "../services/checkout_metrics";
import {
  getAvailableToPromise,
  hasActiveCartHold,
  resetReservationLedgerForTests,
  seedOnHandSku,
} from "../services/reservation_ledger";

const ACME_AUTH = { authorization: "Bearer org-acme-01:alice@acme.com" };
const GLOBEX_HOLD_AUTH = { authorization: "Bearer org-globex-02:bob@globex.com" };

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
    end(body: string) {
      resolve({ status: this.statusCode, body });
    },
  } as unknown as ServerResponse;
  return { res, finished };
}

afterEach(() => {
  resetReservationLedgerForTests();
  resetCheckoutConfigForTests();
  resetCheckoutMetricsForTests();
});

test("preflight returns non-zero shipping and tax", async () => {
  seedOnHandSku("SKU-100", 5);
  const { res, finished } = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      {
        cart_id: "cart-100-usd",
        subtotal: 100,
        lines: [{ sku: "SKU-100", qty: 1 }],
      },
      ACME_AUTH,
    ),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 200);
  const json = JSON.parse(out.body) as {
    shipping_fee: number;
    tax: number;
    quote_version: string;
  };
  assert.ok(json.shipping_fee > 0);
  assert.ok(json.tax > 0);
  assert.strictEqual(json.quote_version.length, 64);
});

test("valid coupon updates quote and version", async () => {
  seedOnHandSku("SKU-C", 2);
  const pre = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      { cart_id: "cart-coupon", subtotal: 100, lines: [{ sku: "SKU-C", qty: 1 }] },
      ACME_AUTH,
    ),
    pre.res,
  );
  const preOut = JSON.parse((await pre.finished).body) as { quote_version: string };

  const coupon = captureResponse();
  await handle_coupon_apply(
    mockInboundJson(
      {
        cart_id: "cart-coupon",
        code: "SAVE10",
        current_quote_version: preOut.quote_version,
        subtotal: 100,
      },
      ACME_AUTH,
    ),
    coupon.res,
  );
  const couponOut = await coupon.finished;
  assert.strictEqual(couponOut.status, 200);
  const json = JSON.parse(couponOut.body) as {
    applied: boolean;
    quote: { grand_total: number; quote_version: string };
  };
  assert.strictEqual(json.applied, true);
  assert.ok(json.quote.grand_total < 100 + 9.99 + (100 + 9.99) * 0.08);
  assert.notStrictEqual(json.quote.quote_version, preOut.quote_version);
});

test("expired coupon rejection", async () => {
  const { res, finished } = captureResponse();
  await handle_coupon_apply(
    mockInboundJson(
      {
        cart_id: "cart-expired",
        code: "EXPIRED20",
        current_quote_version: "a".repeat(64),
        subtotal: 100,
      },
      ACME_AUTH,
    ),
    res,
  );
  const out = await finished;
  const json = JSON.parse(out.body) as { applied: boolean; reason: string };
  assert.strictEqual(json.applied, false);
  assert.strictEqual(json.reason, "COUPON_EXPIRED");
});

test("explicit hold release restores inventory", async () => {
  seedOnHandSku("SKU-R", 2);
  const pre = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      { cart_id: "cart-release", subtotal: 50, lines: [{ sku: "SKU-R", qty: 1 }] },
      ACME_AUTH,
    ),
    pre.res,
  );
  const preJson = JSON.parse((await pre.finished).body) as { hold_id: string };
  assert.ok(preJson.hold_id);
  assert.ok(hasActiveCartHold("cart-release"));

  const rel = captureResponse();
  await handle_checkout_release(
    mockInboundJson({ hold_id: preJson.hold_id }, ACME_AUTH),
    rel.res,
  );
  assert.strictEqual((await rel.finished).status, 200);
  assert.strictEqual(hasActiveCartHold("cart-release"), false);
  assert.strictEqual(getAvailableToPromise("SKU-R"), 2);
});

test("submit with stale quote version returns QUOTE_STALE", async () => {
  seedOnHandSku("SKU-S", 2);
  const pre = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      { cart_id: "cart-stale", subtotal: 100, lines: [{ sku: "SKU-S", qty: 1 }] },
      ACME_AUTH,
    ),
    pre.res,
  );
  const preJson = JSON.parse((await pre.finished).body) as { quote_version: string };

  const coupon = captureResponse();
  await handle_coupon_apply(
    mockInboundJson(
      {
        cart_id: "cart-stale",
        code: "SAVE10",
        current_quote_version: preJson.quote_version,
        subtotal: 100,
      },
      ACME_AUTH,
    ),
    coupon.res,
  );
  const couponJson = JSON.parse((await coupon.finished).body) as {
    quote: { quote_version: string };
  };

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
  assert.ok(couponJson.quote.quote_version);
});

test("unauthenticated preflight denied", async () => {
  const { res, finished } = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson({ cart_id: "cart-auth", subtotal: 10 }),
    res,
  );
  assert.strictEqual((await finished).status, 401);
});

test("cross-tenant hold release denied", async () => {
  seedOnHandSku("SKU-T", 1);
  const pre = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      { cart_id: "cart-tenant-b", subtotal: 20, lines: [{ sku: "SKU-T", qty: 1 }] },
      GLOBEX_HOLD_AUTH,
    ),
    pre.res,
  );
  const holdId = (JSON.parse((await pre.finished).body) as { hold_id: string }).hold_id;

  const rel = captureResponse();
  await handle_checkout_release(
    mockInboundJson({ hold_id: holdId }, ACME_AUTH),
    rel.res,
  );
  assert.strictEqual((await rel.finished).status, 403);
});

test("pipeline flag OFF restores legacy behavior", async () => {
  setCheckoutConfigForTests({ commercialPipelineEnabled: false });
  const { res, finished } = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson({ cart_id: "cart-flag", subtotal: 100 }, ACME_AUTH),
    res,
  );
  const json = JSON.parse((await finished).body) as { shipping_fee: number; tax: number };
  assert.strictEqual(json.shipping_fee, 0);
  assert.strictEqual(json.tax, 0);
});

test("hold expires during submission", async () => {
  setCheckoutConfigForTests({ holdTtlSeconds: 1 });
  seedOnHandSku("SKU-E", 1);
  const pre = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      { cart_id: "cart-expire", subtotal: 80, lines: [{ sku: "SKU-E", qty: 1 }] },
      ACME_AUTH,
    ),
    pre.res,
  );
  const preJson = JSON.parse((await pre.finished).body) as { quote_version: string };
  await new Promise((r) => setTimeout(r, 1100));

  const submit = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-expire",
      payment_method: "card",
      quote_version: preJson.quote_version,
    }),
    submit.res,
  );
  const submitOut = await submit.finished;
  assert.strictEqual(submitOut.status, 409);
  assert.strictEqual((JSON.parse(submitOut.body) as { code: string }).code, "HOLD_EXPIRED");
  assert.strictEqual(hasActiveCartHold("cart-expire"), false);
});

test("latency tracking on preflight", async () => {
  const { res, finished } = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson({ cart_id: "cart-latency", subtotal: 50 }, ACME_AUTH),
    res,
  );
  await finished;
  const metrics = getCheckoutMetrics();
  assert.ok(metrics.checkout_quote_latency_samples.length >= 1);
});

test("full checkout commercial journey", async () => {
  seedOnHandSku("SKU-J", 3);
  const pre = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      { cart_id: "cart-journey", subtotal: 120, lines: [{ sku: "SKU-J", qty: 1 }] },
      ACME_AUTH,
    ),
    pre.res,
  );
  const preJson = JSON.parse((await pre.finished).body) as { quote_version: string };

  const coupon = captureResponse();
  await handle_coupon_apply(
    mockInboundJson(
      {
        cart_id: "cart-journey",
        code: "SAVE10",
        current_quote_version: preJson.quote_version,
        subtotal: 120,
      },
      ACME_AUTH,
    ),
    coupon.res,
  );
  const couponJson = JSON.parse((await coupon.finished).body) as {
    quote: { quote_version: string };
  };

  const submit = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-journey",
      payment_method: "card",
      quote_version: couponJson.quote.quote_version,
    }),
    submit.res,
  );
  assert.strictEqual((await submit.finished).status, 200);
});
