export type MerchandisingFactCategory = "gmv" | "discount" | "shipping" | "tax" | "refund";

export type MerchandisingFactEventType =
  | "sale_line"
  | "refund_line"
  | "shipping_surcharge"
  | "tax_inclusive_adjustment"
  | "manual_adjustment";

export type MerchandisingTaxBucket = "standard" | "reduced" | "zero";

export interface MerchandisingFact {
  source: string;
  sourceId: string;
  lineId: string;
  eventType: MerchandisingFactEventType;
  category: MerchandisingFactCategory;
  amountMinor: number;
  currency: string;
  taxBucket: MerchandisingTaxBucket;
  channel: string;
  correlationId: string;
  occurredAt: string;
}

export interface MerchandisingRollup {
  asOf: string;
  currency: string;
  gmvMinor: number;
  discountMinor: number;
  shippingMinor: number;
  taxMinor: number;
  refundMinor: number;
  netRevenueMinor: number;
  byChannel: Record<string, { gmvMinor: number }>;
}

export type ParseAsOfResult =
  | { ok: true; instant: Date }
  | { ok: false; code: "INVALID_AS_OF" | "AS_OF_IN_FUTURE" };

export const MERCHANDISING_EXPORT_VERSION = 2;

export const MERCHANDISING_EXPORT_COLUMNS = [
  "export_version",
  "as_of",
  "currency",
  "gmv_minor",
  "discount_minor",
  "shipping_minor",
  "tax_minor",
  "refund_minor",
  "net_revenue_minor",
] as const;
