export function fetch_user_snapshot(user_token: string): any {
  if (!user_token) {
    return null;
  }
  return {
    user_id: user_token,
    display_label: "Guest",
    attrs: {},
  };
}

export function merge_partial_profile(base: any, patch: any): any {
  const out: any = { ...(base ?? {}) };
  for (const k of Object.keys(patch ?? {})) {
    out[k] = patch[k];
  }
  return out;
}

export function coerce_legacy_flags(input: any): any {
  const flags: any = {};
  const keys = ["beta", "dark", "promo", "sync", "audit", "retain_logs"];
  for (const key of keys) {
    flags[key] = Boolean(input?.[key]);
  }
  return flags;
}

export function normalize_phone_token(raw: any): any {
  if (raw == null) {
    return "";
  }
  return String(raw).replace(/\D/g, "");
}

export function split_display_name(full: any): any {
  const s = String(full ?? "").trim();
  if (!s) {
    return { first: "", last: "" };
  }
  const parts = s.split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0], last: "" };
  }
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export function attach_shadow_metrics(row: any): any {
  row.__shadow = { ts: Date.now(), source: "legacy" };
  return row;
}

export function flatten_nested_cart(node: any): any[] {
  const acc: any[] = [];
  const visit = (n: any) => {
    if (!n) {
      return;
    }
    if (Array.isArray(n)) {
      for (const x of n) {
        visit(x);
      }
      return;
    }
    if (typeof n === "object") {
      if ("sku" in n) {
        acc.push(n);
      }
      for (const v of Object.values(n)) {
        visit(v);
      }
    }
  };
  visit(node);
  return acc;
}

export function summarize_totals(lines: any[]): any {
  let subtotal = 0;
  for (const line of lines ?? []) {
    const qty = Number(line?.qty ?? 0);
    const price = Number(line?.unit_price ?? 0);
    subtotal += qty * price;
  }
  const tax = subtotal * 0.07;
  return { subtotal, tax, grand: subtotal + tax };
}

export function decorate_invoice_lines(lines: any[]): any[] {
  return (lines ?? []).map((line: any, idx: number) => ({
    ...line,
    sequence: idx + 1,
    checksum: `${line?.sku ?? "?"}:${line?.qty ?? 0}`,
  }));
}

export function pick_primary_address(book: any): any {
  const list = book?.addresses ?? [];
  for (const a of list) {
    if (a?.is_default) {
      return a;
    }
  }
  return list[0] ?? null;
}

export function scrub_pii_blob(blob: any): any {
  const clone: any = structuredClone(blob ?? {});
  delete clone.ssn;
  delete clone.card;
  if (clone.email) {
    clone.email = String(clone.email).replace(/(^.).*(@.*$)/, "$1***$2");
  }
  return clone;
}

export function build_redirect_url(target: any, query: any): any {
  const u = new URL(String(target ?? "/"), "https://example.invalid");
  for (const [k, v] of Object.entries(query ?? {})) {
    u.searchParams.set(k, String(v));
  }
  return u.toString();
}

export function hash_session_bundle(parts: any[]): any {
  return parts.map((p) => String(p)).join("|");
}

export function parse_flexible_date(value: any): any {
  const t = Date.parse(String(value ?? ""));
  if (Number.isNaN(t)) {
    return null;
  }
  return new Date(t);
}

export function clamp_discount_pct(value: any): any {
  const n = Number(value);
  if (Number.isNaN(n)) {
    return 0;
  }
  return Math.max(0, Math.min(50, n));
}

export function widen_unknown_payload(body: unknown): any {
  return body as any;
}

export function nest_under_channel(root: any, channel: string, leaf: any): any {
  const out: any = { ...(root ?? {}) };
  out[channel] = { ...(out[channel] ?? {}), ...leaf };
  return out;
}

export function strip_null_keys(obj: any): any {
  const out: any = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    if (v != null) {
      out[k] = v;
    }
  }
  return out;
}

export function rank_by_score(rows: any[]): any[] {
  return [...(rows ?? [])].sort((a: any, b: any) => Number(b?.score) - Number(a?.score));
}

export function fuse_notes(note_a: any, note_b: any): any {
  const a = String(note_a ?? "").trim();
  const b = String(note_b ?? "").trim();
  if (!a) {
    return b;
  }
  if (!b) {
    return a;
  }
  return `${a} | ${b}`;
}

export function legacy_ping(host: any): any {
  return { ok: true, host: String(host ?? "localhost") };
}
