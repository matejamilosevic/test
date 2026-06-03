import type { MerchandisingRollup } from "./merchandising_types";
import { MERCHANDISING_EXPORT_COLUMNS, MERCHANDISING_EXPORT_VERSION } from "./merchandising_types";

export function merchandisingRollupToExportRecord(rollup: MerchandisingRollup): Record<string, number | string> {
  return {
    export_version: MERCHANDISING_EXPORT_VERSION,
    as_of: rollup.asOf,
    currency: rollup.currency,
    gmv_minor: rollup.gmvMinor,
    discount_minor: rollup.discountMinor,
    shipping_minor: rollup.shippingMinor,
    tax_minor: rollup.taxMinor,
    refund_minor: rollup.refundMinor,
    net_revenue_minor: rollup.netRevenueMinor,
  };
}

export function merchandisingRollupToCsvRow(rollup: MerchandisingRollup): string {
  const rec = merchandisingRollupToExportRecord(rollup);
  return MERCHANDISING_EXPORT_COLUMNS.map((c) => String(rec[c])).join(",");
}

export function merchandisingRollupToCsvHeader(): string {
  return MERCHANDISING_EXPORT_COLUMNS.join(",");
}
