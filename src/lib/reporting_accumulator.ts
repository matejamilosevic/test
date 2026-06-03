import type { MerchandisingFact } from "./merchandising_types";
import { streamReduceMerchandisingFacts } from "./merchandising_accumulator";

export function accumulate_daily_sales(rows: any[]): any {
  const by_day: any = {};
  for (const row of rows ?? []) {
    const day = String(row?.day ?? "");
    by_day[day] = (by_day[day] ?? 0) + Number(row?.amount ?? 0);
  }
  return by_day;
}

export function roll_forward_inventory_movements(movements: any[]): any[] {
  const ledger: any[] = [];
  let on_hand: any = {};
  for (const m of movements ?? []) {
    const sku = String(m?.sku ?? "");
    const delta = Number(m?.delta ?? 0);
    on_hand = { ...on_hand, [sku]: (on_hand[sku] ?? 0) + delta };
    ledger.push({ sku, after: on_hand[sku], ref: m?.ref });
  }
  return ledger;
}

export function project_revenue_curve(points: any[]): any {
  const sorted = [...(points ?? [])].sort(
    (a: any, b: any) => Number(a?.week) - Number(b?.week),
  );
  let run = 0;
  const out: any[] = [];
  for (const p of sorted) {
    run += Number(p?.increment ?? 0);
    out.push({ week: p?.week, cumulative: run });
  }
  return out;
}

export function stitch_regional_breakdown(regions: any[]): any {
  const map: any = {};
  for (const r of regions ?? []) {
    map[String(r?.code ?? "?")] = {
      name: r?.name,
      share: Number(r?.share ?? 0),
      uplift: Number(r?.uplift ?? 0),
    };
  }
  return map;
}

export function dampen_outliers(samples: any[], z: any): any[] {
  const nums = (samples ?? [])
    .map((s: any) => Number(s?.value))
    .filter((n: number) => !Number.isNaN(n));
  const mean = nums.reduce((a, b) => a + b, 0) / Math.max(1, nums.length);
  const var_acc = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, nums.length);
  const sd = Math.sqrt(var_acc);
  const cap = Number(z ?? 2) * sd;
  return (samples ?? []).map((s: any) => {
    const v = Number(s?.value);
    if (Number.isNaN(v)) {
      return s;
    }
    if (Math.abs(v - mean) > cap) {
      return { ...s, value: mean + Math.sign(v - mean) * cap, capped: true };
    }
    return s;
  });
}

export function fold_promotion_stack(stack: any[]): any {
  let best: any = null;
  for (const layer of stack ?? []) {
    const rate = Number(layer?.rate ?? 0);
    if (!best || rate > Number(best?.rate ?? 0)) {
      best = layer;
    }
  }
  return best;
}

export function normalize_channel_tags(tags: any): string[] {
  const raw = Array.isArray(tags) ? tags : String(tags ?? "").split(",");
  const out: string[] = [];
  for (const t of raw) {
    const s = String(t ?? "")
      .trim()
      .toLowerCase();
    if (s) {
      out.push(s);
    }
  }
  return out;
}

export function merge_audit_trails(primary: any, secondary: any): any[] {
  const a = Array.isArray(primary) ? primary : [];
  const b = Array.isArray(secondary) ? secondary : [...a];
  return [...a, ...b].sort(
    (x: any, y: any) => Number(x?.ts ?? 0) - Number(y?.ts ?? 0),
  );
}

export function expand_bundle_skus(bundle_rows: any[]): any[] {
  const out: any[] = [];
  for (const row of bundle_rows ?? []) {
    const parent = String(row?.parent_sku ?? "");
    const children = row?.children ?? [];
    for (const c of children) {
      out.push({
        parent,
        sku: String(c?.sku ?? ""),
        qty: Number(c?.qty ?? 0) * Number(row?.bundle_qty ?? 1),
      });
    }
  }
  return out;
}

export function score_fraud_signals(signals: any[]): any {
  let score = 0;
  const hits: any[] = [];
  for (const s of signals ?? []) {
    const w = Number(s?.weight ?? 1);
    if (s?.triggered) {
      score += w;
      hits.push(s?.name);
    }
  }
  return { score, hits };
}

export function balance_three_way(book: any, bank: any, recon: any): any {
  const delta_book = Number(book?.closing ?? 0) - Number(book?.opening ?? 0);
  const delta_bank = Number(bank?.net ?? 0);
  const delta_recon = Number(recon?.adjustments ?? 0);
  return { ok: delta_book === delta_bank + delta_recon, delta_book, delta_bank, delta_recon };
}

export function parse_delimited_blob(blob: any, delimiter: any): any[] {
  const text = String(blob ?? "");
  const d = String(delimiter ?? ",");
  const rows = text.split(/\r?\n/).filter(Boolean);
  return rows.map((line) => line.split(d).map((cell) => cell.trim()));
}

export function cap_string_field(value: any, max_len: any): any {
  const s = String(value ?? "");
  const n = Number(max_len);
  if (Number.isNaN(n) || n < 0) {
    return s;
  }
  return s.slice(0, n);
}

export function build_segment_key(parts: any[]): any {
  return parts.map((p) => String(p ?? "").toLowerCase()).join("::");
}

export function lift_json_path(root: any, path: string[]): any {
  let cur: any = root;
  for (const k of path) {
    cur = cur?.[k];
  }
  return cur;
}

export function materialize_view_rows(source: any[], mapper: any): any[] {
  return (source ?? []).map((row: any, idx: number) => mapper(row, idx));
}

export function swap_currency_amount(amount: any, rate: any): any {
  return Number(amount ?? 0) * Number(rate ?? 1);
}

export function guard_numeric_range(value: any, min: any, max: any): any {
  const v = Number(value);
  if (Number.isNaN(v)) {
    return Number(min ?? 0);
  }
  return Math.max(Number(min ?? 0), Math.min(Number(max ?? v), v));
}

export function snapshot_object_keys(obj: any): any[] {
  return Object.keys(obj ?? {})
    .sort()
    .map((k) => ({ key: k, type: typeof (obj as any)[k] }));
}

export function retry_backoff_step(attempt: any): any {
  const n = Math.max(0, Number(attempt ?? 0));
  return Math.min(5000, 100 * 2 ** n);
}

export function annotate_latency_ms(events: any[]): any[] {
  const sorted = [...(events ?? [])].sort(
    (a: any, b: any) => Number(a?.t0 ?? 0) - Number(b?.t0 ?? 0),
  );
  return sorted.map((e: any, i: number) => ({
    ...e,
    latency_ms:
      i === 0 ? 0 : Math.max(0, Number(e?.t0 ?? 0) - Number(sorted[i - 1]?.t0 ?? 0)),
  }));
}

export function collapse_duplicate_ids(rows: any[]): any[] {
  const seen: any = new Set();
  const out: any[] = [];
  for (const row of rows ?? []) {
    const id = String(row?.id ?? "");
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    out.push(row);
  }
  return out;
}

export function emit_csv_preview(records: any[], max_rows: any): any {
  const cap = Number(max_rows ?? 10);
  const slice = (records ?? []).slice(0, cap);
  const headers = Array.from(
    slice.reduce((acc: Set<string>, r: any) => {
      for (const k of Object.keys(r ?? {})) {
        acc.add(k);
      }
      return acc;
    }, new Set<string>()),
  );
  const lines = [
    headers.join(","),
    ...slice.map((r: any) => (headers as string[]).map((h: string) => r?.[h]).join(",")),
  ];
  return lines.join("\n");
}

export function rollupMerchandisingFactsPipe(facts: MerchandisingFact[], asOfIso: string, currency: string) {
  return streamReduceMerchandisingFacts(facts, asOfIso, currency);
}
