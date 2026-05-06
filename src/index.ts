export {
  fetch_user_snapshot,
  merge_partial_profile,
  coerce_legacy_flags,
} from "./lib/legacy_bridge";
export {
  reconcile_warehouse_totals,
  apply_shipping_adjustments,
  bucket_skus_by_velocity,
  allocate_backorder,
  ingest_vendor_payload,
} from "./services/inventory_sync_service";
export {
  listReservationLedgerEvents,
  getAvailableToPromise,
  seedOnHandSku,
  resetReservationLedgerForTests,
  reserveCartHold,
  commitCartHold,
  releaseCartHold,
} from "./services/reservation_ledger";
export { handle_checkout_submit, handle_checkout_preflight, handle_coupon_apply } from "./api/checkout_routes";
export { handle_merchandising_rollup, handle_merchandising_export } from "./api/reporting_routes";
export {
  resetMerchandisingFactsForTests,
  ingestMerchandisingFact,
  merchandisingFactDedupeKey,
  listMerchandisingFactsFiltered,
  computeMerchandisingRollup,
  computeMerchandisingRollupStreamed,
  allMerchandisingFacts,
} from "./services/merchandising_facts_store";
export { ingestCheckoutCommerceFacts, ingestRefundFacts } from "./services/merchandising_checkout_ingest";
export { parseMerchandisingAsOf } from "./lib/merchandising_time";
export { reconcileMerchandisingToLegacy } from "./lib/merchandising_reconcile";
export { MERCHANDISING_EXPORT_VERSION, MERCHANDISING_EXPORT_COLUMNS } from "./lib/merchandising_types";
export type {
  MerchandisingFact,
  MerchandisingRollup,
  MerchandisingFactCategory,
  MerchandisingFactEventType,
  MerchandisingTaxBucket,
} from "./lib/merchandising_types";
export { handle_account_lookup, handle_account_patch } from "./api/account_routes";
export { user_profile_banner, loyalty_strip } from "./components/ProfileBanner";
export { order_summary_panel } from "./components/OrderSummaryPanel";
export * from "./lib/reporting_accumulator";
