import type { MerchandisingRollup } from "./merchandising_types";

export interface ReconciliationReport {
  ok: boolean;
  deltaMinor: number;
  report: string;
}

export function reconcileMerchandisingToLegacy(input: {
  rollup: MerchandisingRollup;
  legacyNetMinor: number;
  toleranceMinor: number;
}): ReconciliationReport {
  const computed = input.rollup.netRevenueMinor;
  const delta = computed - input.legacyNetMinor;
  const ok = Math.abs(delta) <= input.toleranceMinor;
  const report = [
    `merchandising.net_revenue_minor=${computed}`,
    `legacy.net_minor=${input.legacyNetMinor}`,
    `delta_minor=${delta}`,
    `tolerance_minor=${input.toleranceMinor}`,
    `status=${ok ? "ok" : "breach"}`,
  ].join(";");
  return { ok, deltaMinor: delta, report };
}
