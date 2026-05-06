import type { MerchandisingFact } from "../lib/merchandising_types";
import { ingestMerchandisingFact } from "./merchandising_facts_store";

export interface CheckoutCommerceIngestInput {
  orderRef: string;
  correlationId: string;
  occurredAt: string;
  currency: string;
  channel: string;
  discountMinor?: number;
  shippingMinor?: number;
  taxMinor?: number;
  taxInclusiveMinor?: number;
  lines: Array<{
    lineId: string;
    sku: string;
    qty: number;
    grossMinor: number;
    taxBucket: "standard" | "reduced" | "zero";
  }>;
}

export function ingestCheckoutCommerceFacts(input: CheckoutCommerceIngestInput): { inserted: number; skipped: number } {
  let inserted = 0;
  let skipped = 0;
  const base = {
    source: "checkout",
    sourceId: input.orderRef,
    currency: input.currency,
    channel: input.channel,
    correlationId: input.correlationId,
    occurredAt: input.occurredAt,
  };

  for (const line of input.lines) {
    const fact: MerchandisingFact = {
      ...base,
      lineId: line.lineId,
      eventType: "sale_line",
      category: "gmv",
      amountMinor: line.grossMinor,
      taxBucket: line.taxBucket,
    };
    const r = ingestMerchandisingFact(fact);
    if (r.inserted) {
      inserted++;
    } else {
      skipped++;
    }
  }

  if (input.discountMinor != null && input.discountMinor > 0) {
    const r = ingestMerchandisingFact({
      ...base,
      lineId: "order:discount",
      eventType: "manual_adjustment",
      category: "discount",
      amountMinor: input.discountMinor,
      taxBucket: "standard",
    });
    if (r.inserted) {
      inserted++;
    } else {
      skipped++;
    }
  }

  if (input.shippingMinor != null && input.shippingMinor > 0) {
    const r = ingestMerchandisingFact({
      ...base,
      lineId: "order:shipping",
      eventType: "shipping_surcharge",
      category: "shipping",
      amountMinor: input.shippingMinor,
      taxBucket: "zero",
    });
    if (r.inserted) {
      inserted++;
    } else {
      skipped++;
    }
  }

  if (input.taxMinor != null && input.taxMinor > 0) {
    const r = ingestMerchandisingFact({
      ...base,
      lineId: "order:tax",
      eventType: "manual_adjustment",
      category: "tax",
      amountMinor: input.taxMinor,
      taxBucket: "standard",
    });
    if (r.inserted) {
      inserted++;
    } else {
      skipped++;
    }
  }

  if (input.taxInclusiveMinor != null && input.taxInclusiveMinor > 0) {
    const r = ingestMerchandisingFact({
      ...base,
      lineId: "order:tax_inclusive",
      eventType: "tax_inclusive_adjustment",
      category: "tax",
      amountMinor: input.taxInclusiveMinor,
      taxBucket: "standard",
    });
    if (r.inserted) {
      inserted++;
    } else {
      skipped++;
    }
  }

  return { inserted, skipped };
}

export function ingestRefundFacts(input: {
  orderRef: string;
  correlationId: string;
  occurredAt: string;
  currency: string;
  channel: string;
  refundMinor: number;
  lineId: string;
}): { inserted: boolean } {
  const fact: MerchandisingFact = {
    source: "orders",
    sourceId: input.orderRef,
    lineId: input.lineId,
    eventType: "refund_line",
    category: "refund",
    amountMinor: input.refundMinor,
    currency: input.currency,
    taxBucket: "standard",
    channel: input.channel,
    correlationId: input.correlationId,
    occurredAt: input.occurredAt,
  };
  const r = ingestMerchandisingFact(fact);
  return { inserted: r.inserted };
}
