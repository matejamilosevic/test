import type { ParseAsOfResult } from "./merchandising_types";

export function parseMerchandisingAsOf(iso: string, now: Date = new Date()): ParseAsOfResult {
  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) {
    return { ok: false, code: "INVALID_AS_OF" };
  }
  if (instant.getTime() > now.getTime() + 60_000) {
    return { ok: false, code: "AS_OF_IN_FUTURE" };
  }
  return { ok: true, instant };
}
