import { useCallback, useEffect, useState } from "react";
import type { AccountLookupResponse, AccountProfile, AsyncDataState } from "../types/account";

export type UseAccountProfileResult = AsyncDataState<AccountProfile>;
export type UseLoyaltyPointsResult = AsyncDataState<AccountLookupResponse> & {
  points: number | null;
};

export function useAccountProfile(accountId?: string): UseAccountProfileResult {
  const [data, setData] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(accountId));
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    if (!accountId) {
      return;
    }
    setLoading(true);
    setError(null);
    setRefetchTrigger((current) => current + 1);
  }, [accountId]);

  useEffect(() => {
    if (!accountId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/account?id=${encodeURIComponent(accountId)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load profile");
        }
        return response.json() as Promise<AccountProfile>;
      })
      .then((profile) => {
        if (!cancelled) {
          setData(profile ?? null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accountId, refetchTrigger]);

  return { data, loading, error, refetch };
}

export function useLoyaltyPoints(userId?: string, initialPoints?: number): UseLoyaltyPointsResult {
  const [data, setData] = useState<AccountLookupResponse | null>(null);
  const [points, setPoints] = useState<number | null>(initialPoints ?? null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    if (!userId) {
      return;
    }
    setLoading(true);
    setError(null);
    setRefetchTrigger((current) => current + 1);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setData(null);
      setPoints(initialPoints ?? null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/account/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load loyalty points");
        }
        return response.json() as Promise<AccountLookupResponse>;
      })
      .then((payload) => {
        if (!cancelled) {
          setData(payload ?? null);
          setPoints(payload?.points ?? null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialPoints, refetchTrigger, userId]);

  return { data, points, loading, error, refetch };
}
