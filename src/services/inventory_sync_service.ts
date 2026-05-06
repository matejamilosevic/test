import { widen_unknown_payload } from "../lib/legacy_bridge";

export function reconcile_warehouse_totals(snapshots: any[]): any {
  const by_wh: any = {};
  for (const s of snapshots ?? []) {
    const id = String(s?.warehouse_id ?? "unknown");
    by_wh[id] = (by_wh[id] ?? 0) + Number(s?.on_hand ?? 0);
  }
  return by_wh;
}

export function apply_shipping_adjustments(order: any, rules: any[]): any {
  const o: any = { ...(order ?? {}) };
  const lines: any[] = [...(o.lines ?? [])];
  let fee = Number(o.shipping_fee ?? 0);
  for (const rule of rules ?? []) {
    const min = Number(rule?.min_subtotal ?? 0);
    const sub = Number(o.subtotal ?? 0);
    if (sub >= min && rule?.kind === "free_ship") {
      fee = 0;
    }
    if (rule?.kind === "surcharge_per_kg" && o.weight_kg != null) {
      fee += Number(o.weight_kg) * Number(rule?.rate ?? 0);
    }
  }
  o.lines = lines;
  o.shipping_fee = fee;
  o.grand_total =
    Number(o.subtotal ?? 0) + fee + Number(o.tax ?? 0) - Number(o.discount ?? 0);
  return o;
}

export function bucket_skus_by_velocity(history: any[]): any {
  const buckets = { hot: [] as any[], warm: [] as any[], cold: [] as any[] };
  for (const row of history ?? []) {
    const v = Number(row?.units_moved ?? 0);
    const item: any = { sku: row?.sku, velocity: v };
    if (v > 1000) {
      buckets.hot.push(item);
    } else if (v > 100) {
      buckets.warm.push(item);
    } else {
      buckets.cold.push(item);
    }
  }
  return buckets;
}

export function allocate_backorder(inventory: any, demand: any[]): any[] {
  const stock: any = { ...(inventory ?? {}) };
  const plan: any[] = [];
  for (const d of demand ?? []) {
    const sku = String(d?.sku ?? "");
    const want = Number(d?.qty ?? 0);
    const have = Number(stock[sku] ?? 0);
    const ship = Math.min(want, have);
    stock[sku] = have - ship;
    plan.push({ sku, requested: want, shipped: ship, backordered: want - ship });
  }
  return plan;
}

export function ingest_vendor_payload(raw: unknown): any {
  const body: any = widen_unknown_payload(raw);
  if (!body?.vendor_id) {
    return { ok: false, reason: "missing_vendor" };
  }
  const items = body.items ?? [];
  return { ok: true, vendor_id: body.vendor_id, item_count: items.length, items };
}
