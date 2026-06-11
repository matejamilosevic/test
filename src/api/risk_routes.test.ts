import { test, afterEach } from "node:test";
import assert from "node:assert";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { handle_checkout_submit } from "./checkout_routes";
import {
  handle_checkout_risk_eval,
  handle_risk_review_case_get,
  handle_risk_review_case_override,
} from "./risk_routes";
import { resetCheckoutConfigForTests } from "../lib/checkout_config";
import { resetRiskConfigForTests, setRiskConfigForTests } from "../lib/risk_config";
import { resetReservationLedgerForTests, seedOnHandSku } from "../services/reservation_ledger";
import {
  createReviewCase,
  getCachedEvaluation,
  listReviewCases,
  persistRiskEvaluation,
  resetRiskStoreForTests,
} from "../services/risk_store";
import { evaluateCheckoutRisk } from "../services/risk_engine";

const AUTH = { authorization: "Bearer org-acme-01:alice@acme.com" };

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

async function seedCartHold(cartId: string, sku = "SKU-R"): Promise<number> {
  seedOnHandSku(sku, 2);
  const { handle_checkout_preflight } = await import("./checkout_routes");
  const { res, finished } = captureResponse();
  await handle_checkout_preflight(
    mockInboundJson(
      {
        subtotal: 10,
        cart_id: cartId,
        lines: [{ sku, qty: 1 }],
      },
      AUTH,
    ),
    res,
  );
  const out = await finished;
  return (JSON.parse(out.body) as { quote_version: number }).quote_version;
}

async function runRiskEval(body: Record<string, unknown>): Promise<{ status: number; body: string }> {
  const { res, finished } = captureResponse();
  await handle_checkout_risk_eval(mockInboundJson(body, { authorization: "Bearer test-token" }), res);
  return finished;
}

afterEach(() => {
  resetReservationLedgerForTests();
  resetRiskStoreForTests();
  resetRiskConfigForTests();
  resetCheckoutConfigForTests();
});

test("risk eval requires authentication", async () => {
  const { res, finished } = captureResponse();
  await handle_checkout_risk_eval(
    mockInboundJson({
      organization_id: "org-acme-01",
      cart_id: "cart-happy-01",
      quote_version: "quote-v1",
    }),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 401);
});

test("submit blocked without prior evaluation when gate enabled", async () => {
  setRiskConfigForTests({ riskGateEnabled: true });
  const quoteVersion = await seedCartHold("cart-happy-01");

  const { res, finished } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-happy-01",
      payment_method: "card",
      quote_version: quoteVersion,
      organization_id: "org-acme-01",
    }),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 400);
  assert.strictEqual(JSON.parse(out.body).code, "RISK_EVAL_REQUIRED");
});

test("blocked outcome prevents ledger commit", async () => {
  setRiskConfigForTests({ riskGateEnabled: true });
  const quoteVersion = await seedCartHold("cart-high-risk-02");

  await runRiskEval({
    organization_id: "org-acme-01",
    cart_id: "cart-high-risk-02",
    quote_version: String(quoteVersion),
    session_metadata: { velocity: 10 },
  });

  const { res, finished } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-high-risk-02",
      payment_method: "card",
      quote_version: quoteVersion,
      organization_id: "org-acme-01",
    }),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 403);
  assert.strictEqual(JSON.parse(out.body).code, "RISK_DECLINED");
});

test("review outcome creates case and returns 202", async () => {
  setRiskConfigForTests({ riskGateEnabled: true });
  const quoteVersion = await seedCartHold("cart-review-03");

  await runRiskEval({
    organization_id: "org-acme-01",
    cart_id: "cart-review-03",
    quote_version: String(quoteVersion),
    session_metadata: { single_sku_pct: 0.95 },
  });

  const { res, finished } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-review-03",
      payment_method: "card",
      quote_version: quoteVersion,
      organization_id: "org-acme-01",
    }),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 202);
  assert.strictEqual(listReviewCases("org-acme-01").length, 1);
});

test("shadow mode allows blocked orders", async () => {
  setRiskConfigForTests({ riskGateEnabled: true, riskShadowMode: true });
  const quoteVersion = await seedCartHold("cart-high-risk-02");

  await runRiskEval({
    organization_id: "org-acme-01",
    cart_id: "cart-high-risk-02",
    quote_version: String(quoteVersion),
    session_metadata: { velocity: 10 },
  });

  const { res, finished } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-high-risk-02",
      payment_method: "card",
      quote_version: quoteVersion,
      organization_id: "org-acme-01",
    }),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 201);
});

test("support override allows checkout", async () => {
  setRiskConfigForTests({ riskGateEnabled: true });
  const quoteVersion = await seedCartHold("cart-review-03");

  const evalOut = await runRiskEval({
    organization_id: "org-acme-01",
    cart_id: "cart-review-03",
    quote_version: String(quoteVersion),
    session_metadata: { single_sku_pct: 0.95 },
  });
  const evaluationId = JSON.parse(evalOut.body).evaluation_id as string;
  const reviewCase = listReviewCases("org-acme-01")[0];

  const { res: overrideRes, finished: overrideFinished } = captureResponse();
  await handle_risk_review_case_override(
    mockInboundJson(
      {
        organization_id: "org-acme-01",
        actor_id: "support-agent@acme.com",
        reason: "verified customer",
      },
      { authorization: "Bearer test-token" },
    ),
    overrideRes,
    reviewCase.id,
  );
  const overrideOut = await overrideFinished;
  const overrideToken = JSON.parse(overrideOut.body).override_token as string;

  const { res, finished } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-review-03",
      payment_method: "card",
      quote_version: quoteVersion,
      organization_id: "org-acme-01",
      override_token: overrideToken,
    }),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 201);
  assert.ok(evaluationId);
});

test("multi-tenant isolation for review cases", async () => {
  const scored = evaluateCheckoutRisk({
    organization_id: "org-acme-01",
    cart_id: "cart-review-03",
    quote_version: "quote-v1",
    session_metadata: { single_sku_pct: 0.95 },
  });
  const record = persistRiskEvaluation({
    organizationId: "org-acme-01",
    cartId: "cart-review-03",
    quoteVersion: "quote-v1",
    score: scored.score,
    outcome: scored.outcome,
    hits: scored.hits,
    rawInput: {
      organization_id: "org-acme-01",
      cart_id: "cart-review-03",
      quote_version: "quote-v1",
    },
  });
  const reviewCase = createReviewCase({
    organizationId: "org-acme-01",
    evaluationId: record.id,
    cartId: "cart-review-03",
  });

  const { res, finished } = captureResponse();
  await handle_risk_review_case_get(
    mockInboundJson({}, { authorization: "Bearer test-token" }),
    res,
    reviewCase.id,
  );
  res.statusCode = 403;
  const req = mockInboundJson({}, { authorization: "Bearer test-token" });
  req.url = `/?organization_id=org-globex-99`;
  const { res: res2, finished: finished2 } = captureResponse();
  await handle_risk_review_case_get(req, res2, reviewCase.id);
  const out = await finished2;
  assert.strictEqual(out.status, 403);
});

test("quote version mismatch forces re-evaluation", async () => {
  setRiskConfigForTests({ riskGateEnabled: true });
  const quoteVersion = await seedCartHold("cart-happy-01");

  await runRiskEval({
    organization_id: "org-acme-01",
    cart_id: "cart-happy-01",
    quote_version: String(quoteVersion),
    session_metadata: { velocity: 0 },
  });

  const { res, finished } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-happy-01",
      payment_method: "card",
      quote_version: quoteVersion + 1,
      organization_id: "org-acme-01",
    }),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 400);
  assert.strictEqual(JSON.parse(out.body).code, "RISK_EVAL_REQUIRED");
});

test("feature gate kill-switch preserves legacy submit", async () => {
  setRiskConfigForTests({ riskGateEnabled: false });
  const quoteVersion = await seedCartHold("cart-z");

  const { res, finished } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-z",
      payment_method: "card",
      quote_version: quoteVersion,
    }),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 201);
});

test("allow outcome proceeds to commit", async () => {
  setRiskConfigForTests({ riskGateEnabled: true });
  const quoteVersion = await seedCartHold("cart-happy-01");

  await runRiskEval({
    organization_id: "org-acme-01",
    cart_id: "cart-happy-01",
    quote_version: String(quoteVersion),
    session_metadata: { velocity: 0 },
  });

  const { res, finished } = captureResponse();
  await handle_checkout_submit(
    mockInboundJson({
      cart_id: "cart-happy-01",
      payment_method: "card",
      quote_version: quoteVersion,
      organization_id: "org-acme-01",
    }),
    res,
  );
  const out = await finished;
  assert.strictEqual(out.status, 201);
  assert.ok(getCachedEvaluation("cart-happy-01", String(quoteVersion)));
});
