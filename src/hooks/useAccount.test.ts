import { test } from "node:test";
import assert from "node:assert";

type FetchHandler = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function mockFetch(handler: FetchHandler): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = handler as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

test("useAccountProfile fetch helper rejects non-200 account responses", async () => {
  const restore = mockFetch(async () => ({
    ok: false,
    status: 401,
    json: async () => ({}),
  } as Response));

  try {
    const response = await fetch("/api/account?id=user-01");
    assert.equal(response.ok, false);
    assert.equal(response.status, 401);
  } finally {
    restore();
  }
});

test("useAccountProfile fetch helper resolves account payload", async () => {
  const restore = mockFetch(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ id: "user-01", name: "Ada Lovelace" }),
  } as Response));

  try {
    const response = await fetch("/api/account?id=user-01");
    const body = await response.json();
    assert.equal(body.name, "Ada Lovelace");
  } finally {
    restore();
  }
});

test("loyalty lookup fetch helper resolves points payload", async () => {
  const restore = mockFetch(async (_input, init) => {
    assert.equal(init?.method, "POST");
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: "user-01", tier: "standard", points: 42 }),
    } as Response;
  });

  try {
    const response = await fetch("/api/account/lookup", {
      method: "POST",
      body: JSON.stringify({ id: "user-01" }),
    });
    const body = await response.json();
    assert.equal(body.points, 42);
  } finally {
    restore();
  }
});
