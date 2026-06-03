export interface AccountProfile {
  id?: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export interface AccountLookupResponse {
  id?: string;
  tier?: string;
  points?: number;
}

export interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch?: () => void;
}
