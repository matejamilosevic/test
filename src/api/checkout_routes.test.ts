import { test, afterEach } from "node:test";
import assert from "node:assert";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  handle_checkout_preflight,
  handle_checkout_submit,
  setResolveRiskGateForSubmitForTests,
} from "./checkout_routes";
import { handle_checkout_risk_eval } from "./risk_routes";
import { resolveRiskGateForSubmit } from "./risk_routes";
import { resetReservationLedgerForTests, seedOnHandSku } from "../services/reservation_ledger";
import { resetMerchandisingFactsForTests, computeMerchandisingRollup } from "../services/merchandising_facts_store";

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
  resetMerchandisingFactsForTests();
  setResolveRiskGateForSubmitForTests();
});

test("checkout risk eval returns 401 without authorization header", async () => {
  const { res, finished } = captureResponse();
  await handle_checkout_risk_eval(
    mockInboundJson({
      organization_id: "org-acme-01",
      cart_id: "cart-auth-01",
      quote_version: "quote-v1",
    }),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 401);
  const json = JSON.parse(out.body) as { code: string; error: string };
  assert.strictEqual(json.code, "UNAUTHORIZED");
  assert.strictEqual(json.error, "Unauthorized");
});

test("successful submit returns 200 with queued status and snapshot shape", async () => {
  seedOnHandSku("SKU-OK", 2);
  const pre = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson({
      subtotal: 42,
      cart_id: "cart-ok",
      lines: [{ sku: "SKU-OK", qty: 1 }],
    }),
    pre.res,
  );
  await pre.finished;

  const { res, finished } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-ok",
      payment_method: "card",
      gift_message: "hi",
    }),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 200);
  const json = JSON.parse(out.body) as {
    status: string;
    snapshot: {
      cart_id: string;
      order_ref: string;
      payment_method: string;
      gift_message: string;
      correlation_id: string;
    };
  };
  assert.strictEqual(json.status, "queued");
  assert.strictEqual(json.snapshot.cart_id, "cart-ok");
  assert.strictEqual(json.snapshot.payment_method, "card");
  assert.strictEqual(json.snapshot.gift_message, "hi");
  assert.match(json.snapshot.order_ref, /^ord_/);
  assert.ok(json.snapshot.correlation_id.length > 0);
});

test("submit returns 500 when risk gate returns malformed failure variant", async () => {
  setResolveRiskGateForSubmitForTests(() => ({ ok: false }) as ReturnType<typeof resolveRiskGateForSubmit>);
  const { res, finished } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-malformed-risk",
      payment_method: "card",
    }),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 500);
  const json = JSON.parse(out.body) as { code: string; error: string };
  assert.strictEqual(json.code, "INTERNAL_ERROR");
  assert.strictEqual(json.error, "Internal error");
});

test("preflight with lines reserves stock; submit commits", async () => {
  seedOnHandSku("SKU-X", 2);
  const { res: r1, finished: f1 } = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson({
      subtotal: 10,
      cart_id: "cart-x",
      lines: [{ sku: "SKU-X", qty: 1 }],
    }),
    r1,
  );
  const out1 = await f1;
  assert.strictEqual(out1.status, 200);

  const { res: r2, finished: f2 } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-x",
      payment_method: "card",
    }),
    r2,
  );
  const out2 = await f2;
  assert.strictEqual(out2.status, 200);
  const json = JSON.parse(out2.body) as { snapshot: { order_ref: string } };
  assert.ok(json.snapshot.order_ref);
});

test("submit without active hold returns NO_ACTIVE_HOLD", async () => {
  const { res, finished } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "missing-cart",
      payment_method: "card",
    }),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 409);
  const json = JSON.parse(out.body) as { code: string };
  assert.strictEqual(json.code, "NO_ACTIVE_HOLD");
});

test("submit with commerce ingests merchandising facts after successful commit", async () => {
  seedOnHandSku("SKU-COM", 5);
  const pre = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson({
      subtotal: 25,
      cart_id: "cart-com",
      lines: [{ sku: "SKU-COM", qty: 1 }],
    }),
    pre.res,
  );
  await pre.finished;

  const { res, finished } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-com",
      payment_method: "card",
      order_id: "ord-com-1",
      commerce: {
        currency: "USD",
        channel: "web",
        lines: [{ lineId: "L1", sku: "SKU-COM", qty: 1, grossMinor: 2500 }],
        discountMinor: 500,
        shippingMinor: 200,
      },
    }),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 200);
  const rollup = computeMerchandisingRollup({ asOfIso: new Date("2098-01-01").toISOString(), currency: "USD" });
  assert.strictEqual(rollup.gmvMinor, 2500);
  assert.strictEqual(rollup.discountMinor, 500);
  assert.strictEqual(rollup.shippingMinor, 200);
  assert.strictEqual(rollup.netRevenueMinor, 2200);
});

test("idempotency key returns cached submit body", async () => {
  seedOnHandSku("SKU-Z", 1);
  const pre = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson({
      subtotal: 1,
      cart_id: "cart-z",
      lines: [{ sku: "SKU-Z", qty: 1 }],
    }),
    pre.res,
  );
  await pre.finished;

  const key = "idem-1";
  const { res: ra, finished: fa } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-z",
      payment_method: "card",
      idempotency_key: key,
    }),
    ra,
  );
  const first = await fa;

  const { res: rb, finished: fb } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-z",
      payment_method: "card",
      idempotency_key: key,
    }),
    rb,
  );
  const second = await fb;

  assert.strictEqual(first.status, 200);
  assert.strictEqual(second.status, 200);
  assert.strictEqual(first.body, second.body);
});
