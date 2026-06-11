import { parseMerchandisingAsOf } from "./merchandising_time";

export type ResolveAsOfIsoResult =
  | { ok: true; asOfIso: string }
  | { ok: false; code: "INVALID_AS_OF" | "AS_OF_IN_FUTURE" };

export function resolveAsOfIso(raw: string | undefined): ResolveAsOfIsoResult {
  if (!raw) {
    return { ok: true, asOfIso: new Date().toISOString() };
  }
  const parsed = parseMerchandisingAsOf(raw);
  if (parsed.ok === false) {
    return { ok: false, code: parsed.code };
  }
  return { ok: true, asOfIso: parsed.instant.toISOString() };
}
