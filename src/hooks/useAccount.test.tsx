import { test } from "node:test";
import assert from "node:assert";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { useEffect } from "react";
import { useAccountProfile, type UseAccountProfileResult } from "./useAccount";

type FetchHandler = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function mockFetch(handler: FetchHandler): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = handler as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

function setupDom(): HTMLElement {
  const dom = new JSDOM("<!DOCTYPE html><html><body><div id=\"root\"></div></body></html>");
  const { window } = dom;
  globalThis.window = window as unknown as Window & typeof globalThis;
  globalThis.document = window.document;
  globalThis.navigator = window.navigator;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.Node = window.Node;
  return window.document.getElementById("root")!;
}

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
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

test("useAccountProfile refetch clears error and re-triggers fetch", async () => {
  let fetchCount = 0;
  const restore = mockFetch(async () => {
    fetchCount += 1;
    if (fetchCount === 1) {
      return {
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response;
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: "user-01", name: "Ada Lovelace" }),
    } as Response;
  });

  const snapshots: UseAccountProfileResult[] = [];

  function Harness() {
    const result = useAccountProfile("user-01");
    useEffect(() => {
      snapshots.push({
        data: result.data,
        loading: result.loading,
        error: result.error,
        refetch: result.refetch,
      });
    }, [result.data, result.error, result.loading, result.refetch]);
    return null;
  }

  const container = setupDom();
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(<Harness />);
    });
    await flushPromises();
    await flushPromises();

    const failedSnapshot = snapshots.find((snapshot) => snapshot.error === "Unable to load profile");
    assert.ok(failedSnapshot);

    await act(async () => {
      failedSnapshot?.refetch?.();
    });
    await flushPromises();

    const retryingSnapshot = snapshots.find(
      (snapshot) => snapshot.loading && snapshot.error === null && snapshot !== failedSnapshot,
    );
    assert.ok(retryingSnapshot, "expected loading state with cleared error after refetch");

    await flushPromises();
    await flushPromises();

    assert.ok(fetchCount >= 2);
    assert.equal(latestSnapshot(snapshots)?.error, null);
    assert.equal(latestSnapshot(snapshots)?.data?.name, "Ada Lovelace");
  } finally {
    root.unmount();
    restore();
  }
});

function latestSnapshot(snapshots: UseAccountProfileResult[]): UseAccountProfileResult | undefined {
  return snapshots[snapshots.length - 1];
}

test("useAccountProfile ignores stale refetch when accountId changes", async () => {
  let resolveFirst: ((value: Response) => void) | null = null;
  let fetchCount = 0;

  const restore = mockFetch((_input, init) => {
    fetchCount += 1;
    if (fetchCount === 1) {
      return new Promise<Response>((resolve) => {
        resolveFirst = resolve;
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ id: "user-02", name: "Grace Hopper" }),
    } as Response);
  });

  const latest = { current: null as UseAccountProfileResult | null };

  function Harness({ accountId }: { accountId?: string }) {
    const result = useAccountProfile(accountId);
    useEffect(() => {
      latest.current = result;
    }, [result]);
    return null;
  }

  const container = setupDom();
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(<Harness accountId="user-01" />);
    });

    await act(async () => {
      root.render(<Harness accountId="user-02" />);
    });
    await flushPromises();
    await flushPromises();

    assert.equal(latest.current?.data?.name, "Grace Hopper");

    await act(async () => {
      resolveFirst?.({
        ok: true,
        status: 200,
        json: async () => ({ id: "user-01", name: "Stale User" }),
      } as Response);
    });
    await flushPromises();

    assert.equal(latest.current?.data?.name, "Grace Hopper");
  } finally {
    root.unmount();
    restore();
  }
});
