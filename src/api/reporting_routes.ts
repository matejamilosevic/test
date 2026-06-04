import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { computeMerchandisingRollup } from "../services/merchandising_facts_store";
import { parseMerchandisingAsOf } from "../lib/merchandising_time";
import {
  merchandisingRollupToCsvHeader,
  merchandisingRollupToCsvRow,
  merchandisingRollupToExportRecord,
} from "../lib/merchandising_export";
import { MERCHANDISING_EXPORT_VERSION } from "../lib/merchandising_types";

const rollupQuerySchema = z.object({
  as_of: z.string().optional(),
  currency: z.string().length(3).default("USD"),
});

const exportQuerySchema = z.object({
  as_of: z.string().optional(),
  currency: z.string().length(3).default("USD"),
  format: z.enum(["json", "csv"]).default("json"),
});

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function resolveAsOfIso(raw: string | undefined): { ok: true; asOfIso: string } | { ok: false; code: "INVALID_AS_OF" | "AS_OF_IN_FUTURE" } {
  if (!raw) {
    return { ok: true, asOfIso: new Date().toISOString() };
  }
  const parsed = parseMerchandisingAsOf(raw);
  if (parsed.ok === false) {
    return { ok: false, code: parsed.code };
  }
  return { ok: true, asOfIso: parsed.instant.toISOString() };
}

export async function handle_merchandising_rollup(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", "http://local.invalid");
  const query = Object.fromEntries(url.searchParams.entries());
  const parsed = rollupQuerySchema.safeParse(query);
  if (!parsed.success) {
    sendJson(res, 400, {
      error: "Validation failed",
      code: "VALIDATION_FAILED",
      details: parsed.error.flatten(),
    });
    return;
  }

  const asOf = resolveAsOfIso(parsed.data.as_of);
  if (asOf.ok === false) {
    sendJson(res, 400, { error: "Invalid as_of parameter", code: asOf.code });
    return;
  }

  const rollup = computeMerchandisingRollup({
    asOfIso: asOf.asOfIso,
    currency: parsed.data.currency,
  });

  sendJson(res, 200, {
    export_version: MERCHANDISING_EXPORT_VERSION,
    rollup,
  });
}

export async function handle_merchandising_export(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", "http://local.invalid");
  const query = Object.fromEntries(url.searchParams.entries());
  const parsed = exportQuerySchema.safeParse(query);
  if (!parsed.success) {
    sendJson(res, 400, {
      error: "Validation failed",
      code: "VALIDATION_FAILED",
      details: parsed.error.flatten(),
    });
    return;
  }

  const asOf = resolveAsOfIso(parsed.data.as_of);
  if (asOf.ok === false) {
    sendJson(res, 400, { error: "Invalid as_of parameter", code: asOf.code });
    return;
  }

  const rollup = computeMerchandisingRollup({
    asOfIso: asOf.asOfIso,
    currency: parsed.data.currency,
  });

  if (parsed.data.format === "csv") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.end([merchandisingRollupToCsvHeader(), merchandisingRollupToCsvRow(rollup)].join("\n"));
    return;
  }

  sendJson(res, 200, {
    export_version: MERCHANDISING_EXPORT_VERSION,
    row: merchandisingRollupToExportRecord(rollup),
  });
}
