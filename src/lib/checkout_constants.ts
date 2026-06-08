export const CHECKOUT_FEATURE_GATES = {
  COMMERCIAL_PIPELINE_V1: "checkout_commercial_pipeline_v1",
} as const;

export const CHECKOUT_ERROR_CODES = {
  QUOTE_STALE: "QUOTE_STALE",
  HOLD_EXPIRED: "HOLD_EXPIRED",
  COUPON_EXPIRED: "COUPON_EXPIRED",
  MIN_SPEND_NOT_MET: "MIN_SPEND_NOT_MET",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
} as const;

export const DEFAULT_FREE_SHIP_THRESHOLD = 50;
export const DEFAULT_FLAT_SHIPPING_FEE = 5;
export const DEFAULT_TAX_RATE = 0.08;
export const DEFAULT_HOLD_TTL_SECONDS = 900;
export const HOLD_EXPIRY_GRACE_SECONDS = 60;

export const DEFAULT_SHIPPING_RULES = [
  { kind: "free_ship" as const, min_subtotal: DEFAULT_FREE_SHIP_THRESHOLD },
  { kind: "flat_fee" as const, fee: DEFAULT_FLAT_SHIPPING_FEE },
];

export interface CouponDefinition {
  code: string;
  rate: number;
  minSpend?: number;
  expired?: boolean;
}

export const COUPON_CATALOG: Record<string, CouponDefinition> = {
  SAVE10: { code: "SAVE10", rate: 0.1 },
  EXPIRED20: { code: "EXPIRED20", rate: 0.2, expired: true },
  MIN100: { code: "MIN100", rate: 0.15, minSpend: 100 },
};
