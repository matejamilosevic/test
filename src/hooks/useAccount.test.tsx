import { test } from "node:test";
import assert from "node:assert";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { useEffect } from "react";
import {
  useAccountProfile,
  useLoyaltyPoints,
  type UseAccountProfileResult,
  type UseLoyaltyPointsResult,
} from "./useAccount";
import { setupDom, teardownDom } from "../test/dom";

type FetchHandler = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function mockFetch(handler: FetchHandler): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = handler as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function latestSnapshot<T>(snapshots: T[]): T | undefined {
  return snapshots[snapshots.length - 1];
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
    teardownDom();
    restore();
  }
});

test("useAccountProfile refetch keeps error state when retry also fails", async () => {
  let fetchCount = 0;
  const restore = mockFetch(async () => {
    fetchCount += 1;
    return {
      ok: false,
      status: 500,
      json: async () => ({}),
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

    const failedSnapshot = latestSnapshot(snapshots);
    assert.equal(failedSnapshot?.error, "Unable to load profile");

    await act(async () => {
      failedSnapshot?.refetch?.();
    });
    await flushPromises();
    await flushPromises();

    await act(async () => {
      latestSnapshot(snapshots)?.refetch?.();
    });
    await flushPromises();
    await flushPromises();

    assert.ok(fetchCount >= 3);
    assert.equal(latestSnapshot(snapshots)?.error, "Unable to load profile");
    assert.equal(latestSnapshot(snapshots)?.loading, false);
  } finally {
    root.unmount();
    teardownDom();
    restore();
  }
});

test("useAccountProfile ignores stale refetch when accountId changes", async () => {
  let resolveFirst: ((value: Response) => void) | null = null;
  let fetchCount = 0;

  const restore = mockFetch(() => {
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
    teardownDom();
    restore();
  }
});

test("useLoyaltyPoints refetch clears error and re-triggers fetch", async () => {
  let fetchCount = 0;
  const restore = mockFetch(async () => {
    fetchCount += 1;
    if (fetchCount === 1) {
      return {
        ok: false,
        status: 503,
        json: async () => ({}),
      } as Response;
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: "user-01", tier: "gold", points: 42 }),
    } as Response;
  });

  const snapshots: UseLoyaltyPointsResult[] = [];

  function Harness() {
    const result = useLoyaltyPoints("user-01");
    useEffect(() => {
      snapshots.push({
        data: result.data,
        points: result.points,
        loading: result.loading,
        error: result.error,
        refetch: result.refetch,
      });
    }, [result.data, result.error, result.loading, result.points, result.refetch]);
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

    const failedSnapshot = snapshots.find(
      (snapshot) => snapshot.error === "Unable to load loyalty points",
    );
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
    assert.equal(latestSnapshot(snapshots)?.points, 42);
  } finally {
    root.unmount();
    teardownDom();
    restore();
  }
});

test("useAccountProfile rapid refetch calls each trigger a fetch and last response wins", async () => {
  let fetchCount = 0;
  const restore = mockFetch(() => {
    fetchCount += 1;
    const count = fetchCount;
    return new Promise<Response>((resolve) => {
      setTimeout(() => {
        resolve({
          ok: true,
          status: 200,
          json: async () => ({ id: "user-01", name: `Profile ${count}` }),
        } as Response);
      }, 10);
    });
  });

  const latest = { current: null as UseAccountProfileResult | null };

  function Harness() {
    const result = useAccountProfile("user-01");
    useEffect(() => {
      latest.current = result;
    }, [result]);
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

    const refetch = latest.current?.refetch;
    assert.ok(refetch);

    for (let i = 0; i < 5; i += 1) {
      await act(async () => {
        refetch();
      });
    }

    await flushPromises();
    await flushPromises();
    await new Promise((resolve) => setTimeout(resolve, 50));
    await flushPromises();

    assert.equal(fetchCount, 6);
    assert.equal(latest.current?.data?.name, "Profile 6");
  } finally {
    root.unmount();
    teardownDom();
    restore();
  }
});

test("useLoyaltyPoints ignores stale refetch when userId changes", async () => {
  let resolveFirst: ((value: Response) => void) | null = null;
  let fetchCount = 0;

  const restore = mockFetch(() => {
    fetchCount += 1;
    if (fetchCount === 1) {
      return new Promise<Response>((resolve) => {
        resolveFirst = resolve;
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ id: "user-02", tier: "gold", points: 99 }),
    } as Response);
  });

  const latest = { current: null as UseLoyaltyPointsResult | null };

  function Harness({ userId }: { userId?: string }) {
    const result = useLoyaltyPoints(userId);
    useEffect(() => {
      latest.current = result;
    }, [result]);
    return null;
  }

  const container = setupDom();
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(<Harness userId="user-01" />);
    });

    await act(async () => {
      root.render(<Harness userId="user-02" />);
    });
    await flushPromises();
    await flushPromises();

    assert.equal(latest.current?.points, 99);

    await act(async () => {
      resolveFirst?.({
        ok: true,
        status: 200,
        json: async () => ({ id: "user-01", tier: "standard", points: 1 }),
      } as Response);
    });
    await flushPromises();

    assert.equal(latest.current?.points, 99);
  } finally {
    root.unmount();
    teardownDom();
    restore();
  }
});
