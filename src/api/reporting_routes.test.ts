import { test, afterEach } from "node:test";
import assert from "node:assert";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { handle_merchandising_export, handle_merchandising_rollup } from "./reporting_routes";
import { resetMerchandisingFactsForTests, ingestMerchandisingFact } from "../services/merchandising_facts_store";
import type { MerchandisingFact } from "../lib/merchandising_types";

function mockReq(path: string): IncomingMessage {
  const r = new Readable({
    read() {
      this.push(null);
    },
  }) as IncomingMessage;
  r.url = path;
  return r;
}

function captureResponse(): { res: ServerResponse; finished: Promise<{ status: number; body: string }> } {
  let resolve!: (v: { status: number; body: string }) => void;
  const finished = new Promise<{ status: number; body: string }>((r) => {
    resolve = r;
  });
  const res = {
    statusCode: 200,
    setHeader() {},
    end(body: string) {
      resolve({ status: this.statusCode, body: String(body) });
    },
  } as unknown as ServerResponse;
  return { res, finished };
}

afterEach(() => {
  resetMerchandisingFactsForTests();
});

test("rollup rejects invalid as_of", async () => {
  const { res, finished } = captureResponse();
  await handle_merchandising_rollup(mockReq("/internal/merchandising/rollup?as_of=not-a-date"), res);
  const out = await finished;
  assert.strictEqual(out.status, 400);
  const json = JSON.parse(out.body) as { code: string };
  assert.strictEqual(json.code, "INVALID_AS_OF");
});

test("rollup rejects future as_of", async () => {
  const { res, finished } = captureResponse();
  await handle_merchandising_rollup(mockReq("/internal/merchandising/rollup?as_of=2099-01-01T00:00:00.000Z"), res);
  const out = await finished;
  assert.strictEqual(out.status, 400);
  const json = JSON.parse(out.body) as { code: string };
  assert.strictEqual(json.code, "AS_OF_IN_FUTURE");
});

test("export json includes export_version and row", async () => {
  ingestMerchandisingFact({
    source: "test",
    sourceId: "o1",
    lineId: "L1",
    eventType: "sale_line",
    category: "gmv",
    amountMinor: 100,
    currency: "USD",
    taxBucket: "standard",
    channel: "web",
    correlationId: "c",
    occurredAt: "2026-05-06T08:00:00.000Z",
  } satisfies MerchandisingFact);
  const { res, finished } = captureResponse();
  await handle_merchandising_export(mockReq("/internal/merchandising/export?currency=USD&format=json"), res);
  const out = await finished;
  assert.strictEqual(out.status, 200);
  const json = JSON.parse(out.body) as { export_version: number; row: { gmv_minor: number } };
  assert.strictEqual(json.export_version, 2);
  assert.strictEqual(json.row.gmv_minor, 100);
});

test("export csv includes header row and stable column order", async () => {
  const { res, finished } = captureResponse();
  await handle_merchandising_export(mockReq("/internal/merchandising/export?currency=USD&format=csv"), res);
  const out = await finished;
  assert.strictEqual(out.status, 200);
  const lines = out.body.split("\n");
  assert.strictEqual(
    lines[0],
    "export_version,as_of,currency,gmv_minor,discount_minor,shipping_minor,tax_minor,refund_minor,net_revenue_minor",
  );
});
