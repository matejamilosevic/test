import { test, afterEach } from "node:test";
import assert from "node:assert";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { handle_checkout_preflight, handle_checkout_submit } from "./checkout_routes";
import { resetReservationLedgerForTests, seedOnHandSku } from "../services/reservation_ledger";

function mockInboundJson(body: unknown): IncomingMessage {
  const buf = Buffer.from(JSON.stringify(body), "utf8");
  const r = new Readable({
    read() {
      this.push(buf);
      this.push(null);
    },
  }) as IncomingMessage;
  r.url = "/";
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
