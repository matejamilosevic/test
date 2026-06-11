import { randomUUID } from "node:crypto";
import { getHoldTtlSeconds } from "../lib/checkout_config";
import { HOLD_EXPIRY_GRACE_SECONDS } from "../lib/checkout_constants";
import { incrementHoldExpiredTotal } from "./checkout_metrics";

export type ReservationReason = "cart_hold" | "committed" | "released";

export interface ReservationLedgerEvent {
  skuId: string;
  locationId: string;
  deltaReserved: number;
  deltaOnHand: number;
  reason: ReservationReason;
  reference: string;
  correlationId: string;
  occurredAt: string;
}

export interface CartLine {
  sku: string;
  qty: number;
}

export interface HoldMetadata {
  holdId: string;
  organizationId: string;
  quoteVersion: number;
  correlationId: string;
  expiresAt: string | null;
  promoCodes: string[];
  released?: boolean;
}

interface MutableCartHold {
  lines: Map<string, number>;
  metadata?: HoldMetadata;
}

function isoNow(): string {
  return new Date().toISOString();
}

function appendEvent(event: Omit<ReservationLedgerEvent, "occurredAt"> & { occurredAt?: string }): ReservationLedgerEvent {
  const full: ReservationLedgerEvent = {
    ...event,
    occurredAt: event.occurredAt ?? isoNow(),
  };
  reservationLedgerState.events.push(full);
  return full;
}

let reservationLedgerState: {
  events: ReservationLedgerEvent[];
  onHand: Map<string, number>;
  cartHolds: Map<string, MutableCartHold>;
  holdIndex: Map<string, string>;
  idempotency: Map<string, string>;
} = {
  events: [],
  onHand: new Map(),
  cartHolds: new Map(),
  holdIndex: new Map(),
  idempotency: new Map(),
};

export function resetReservationLedgerForTests(): void {
  reservationLedgerState = {
    events: [],
    onHand: new Map(),
    cartHolds: new Map(),
    holdIndex: new Map(),
    idempotency: new Map(),
  };
}

export function seedOnHandSku(skuId: string, qty: number): void {
  reservationLedgerState.onHand.set(skuId, Math.max(0, qty));
}

export function listReservationLedgerEvents(): readonly ReservationLedgerEvent[] {
  return reservationLedgerState.events;
}

function globalReservedForSkuExcludingCart(sku: string, cartId: string): number {
  let sum = 0;
  for (const [cid, hold] of reservationLedgerState.cartHolds) {
    if (cid === cartId) {
      continue;
    }
    sum += hold.lines.get(sku) ?? 0;
  }
  return sum;
}

function globalReservedForSku(sku: string): number {
  let sum = 0;
  for (const [, hold] of reservationLedgerState.cartHolds) {
    sum += hold.lines.get(sku) ?? 0;
  }
  return sum;
}

export function getAvailableToPromise(skuId: string): number {
  const onHand = reservationLedgerState.onHand.get(skuId) ?? 0;
  return onHand - globalReservedForSku(skuId);
}

export function getHoldMetadata(cartId: string): HoldMetadata | undefined {
  return reservationLedgerState.cartHolds.get(cartId)?.metadata;
}

export function getHoldMetadataByHoldId(holdId: string): (HoldMetadata & { cartId: string }) | undefined {
  const cartId = reservationLedgerState.holdIndex.get(holdId);
  if (!cartId) {
    return undefined;
  }
  const meta = reservationLedgerState.cartHolds.get(cartId)?.metadata;
  if (!meta) {
    return undefined;
  }
  return { ...meta, cartId };
}

export function hasActiveCartHold(cartId: string): boolean {
  const hold = reservationLedgerState.cartHolds.get(cartId);
  return Boolean(hold && hold.lines.size > 0 && !hold.metadata?.released);
}

export type ReserveCartHoldResult =
  | { ok: true; correlationId: string; holdId: string; expiresAt: string | null }
  | { ok: false; code: "INSUFFICIENT_STOCK"; skuId: string };

export function reserveCartHold(input: {
  cartId: string;
  lines: CartLine[];
  correlationId: string;
  organizationId?: string;
  quoteVersion?: number;
  promoCodes?: string[];
  holdId?: string;
  expiresAtOverride?: string;
}): ReserveCartHoldResult {
  const { cartId, lines, correlationId } = input;
  const normalized = lines.map((l) => ({ sku: String(l.sku), qty: Number(l.qty) }));
  const nextMap = new Map<string, number>();
  for (const { sku, qty } of normalized) {
    if (!Number.isFinite(qty) || qty <= 0 || !sku) {
      continue;
    }
    nextMap.set(sku, (nextMap.get(sku) ?? 0) + qty);
  }

  const oldHold = reservationLedgerState.cartHolds.get(cartId);
  const oldMap = oldHold ? new Map(oldHold.lines) : new Map<string, number>();

  const skus = new Set<string>([...oldMap.keys(), ...nextMap.keys()]);
  for (const sku of skus) {
    const oldQty = oldMap.get(sku) ?? 0;
    const newQty = nextMap.get(sku) ?? 0;
    const globalExcl = globalReservedForSkuExcludingCart(sku, cartId);
    const onHand = reservationLedgerState.onHand.get(sku) ?? 0;
    const maxHoldForThisCart = Math.max(0, onHand - globalExcl);
    if (newQty > maxHoldForThisCart) {
      return { ok: false, code: "INSUFFICIENT_STOCK", skuId: sku };
    }
  }

  for (const sku of skus) {
    const oldQty = oldMap.get(sku) ?? 0;
    const newQty = nextMap.get(sku) ?? 0;
    const diff = newQty - oldQty;
    if (diff !== 0) {
      appendEvent({
        skuId: sku,
        locationId: "default",
        deltaReserved: diff,
        deltaOnHand: 0,
        reason: "cart_hold",
        reference: cartId,
        correlationId,
      });
    }
  }

  const holdId = input.holdId ?? oldHold?.metadata?.holdId ?? `hold-${randomUUID()}`;
  const expiresAt =
    input.expiresAtOverride ?? new Date(Date.now() + getHoldTtlSeconds() * 1000).toISOString();

  if (oldHold?.metadata?.holdId && oldHold.metadata.holdId !== holdId) {
    reservationLedgerState.holdIndex.delete(oldHold.metadata.holdId);
  }

  if (nextMap.size === 0) {
    if (oldHold?.metadata?.holdId) {
      reservationLedgerState.holdIndex.delete(oldHold.metadata.holdId);
    }
    reservationLedgerState.cartHolds.delete(cartId);
  } else {
    const metadata: HoldMetadata = {
      holdId,
      organizationId: input.organizationId ?? oldHold?.metadata?.organizationId ?? "default",
      quoteVersion: input.quoteVersion ?? oldHold?.metadata?.quoteVersion ?? 1,
      correlationId,
      expiresAt,
      promoCodes: input.promoCodes ?? oldHold?.metadata?.promoCodes ?? [],
    };
    reservationLedgerState.cartHolds.set(cartId, { lines: nextMap, metadata });
    reservationLedgerState.holdIndex.set(holdId, cartId);
  }

  return { ok: true, correlationId, holdId, expiresAt };
}

export function updateHoldQuoteMetadata(input: {
  cartId: string;
  quoteVersion: number;
  correlationId: string;
  promoCodes?: string[];
}): void {
  const hold = reservationLedgerState.cartHolds.get(input.cartId);
  if (!hold?.metadata) {
    return;
  }
  hold.metadata.quoteVersion = input.quoteVersion;
  hold.metadata.correlationId = input.correlationId;
  if (input.promoCodes) {
    hold.metadata.promoCodes = input.promoCodes;
  }
  hold.metadata.expiresAt = new Date(Date.now() + getHoldTtlSeconds() * 1000).toISOString();
}

function releaseHoldLines(cartId: string, correlationId: string): void {
  const hold = reservationLedgerState.cartHolds.get(cartId);
  if (!hold || hold.lines.size === 0) {
    return;
  }

  for (const [sku, qty] of hold.lines) {
    appendEvent({
      skuId: sku,
      locationId: "default",
      deltaReserved: -qty,
      deltaOnHand: 0,
      reason: "released",
      reference: cartId,
      correlationId,
    });
  }
  if (hold.metadata) {
    hold.metadata.released = true;
  }
  if (hold.metadata?.holdId) {
    reservationLedgerState.holdIndex.delete(hold.metadata.holdId);
  }
  reservationLedgerState.cartHolds.delete(cartId);
}

export function releaseCartHold(input: { cartId: string; correlationId: string }): void {
  releaseHoldLines(input.cartId, input.correlationId);
}

export type ReleaseHoldByIdResult =
  | { ok: true }
  | { ok: false; code: "FORBIDDEN" };

export function releaseHoldById(input: {
  holdId: string;
  organizationId: string;
  correlationId: string;
}): ReleaseHoldByIdResult {
  const located = getHoldMetadataByHoldId(input.holdId);
  if (!located) {
    return { ok: true };
  }
  if (located.organizationId !== input.organizationId) {
    return { ok: false, code: "FORBIDDEN" };
  }
  releaseHoldLines(located.cartId, input.correlationId);
  return { ok: true };
}

function isHoldExpired(metadata: HoldMetadata | undefined): boolean {
  if (!metadata?.expiresAt) {
    return false;
  }
  const graceMs = HOLD_EXPIRY_GRACE_SECONDS * 1000;
  return Date.now() > Date.parse(metadata.expiresAt) + graceMs;
}

export type ValidateSubmitQuoteResult =
  | { ok: true }
  | { ok: false; code: "QUOTE_STALE" | "HOLD_EXPIRED" | "NO_ACTIVE_HOLD" };

export function validateSubmitQuote(input: {
  cartId: string;
  quoteVersion?: number;
  correlationId: string;
  enforceVersion?: boolean;
}): ValidateSubmitQuoteResult {
  const hold = reservationLedgerState.cartHolds.get(input.cartId);
  if (!hold || hold.lines.size === 0 || hold.metadata?.released) {
    return { ok: false, code: "NO_ACTIVE_HOLD" };
  }

  if (isHoldExpired(hold.metadata)) {
    releaseHoldLines(input.cartId, input.correlationId);
    incrementHoldExpiredTotal();
    return { ok: false, code: "HOLD_EXPIRED" };
  }

  if (input.enforceVersion && input.quoteVersion !== undefined && hold.metadata?.quoteVersion !== undefined) {
    if (input.quoteVersion !== hold.metadata.quoteVersion) {
      return { ok: false, code: "QUOTE_STALE" };
    }
  }

  return { ok: true };
}

export type CommitCartHoldResult =
  | { ok: true; correlationId: string; orderRef: string }
  | { ok: false; code: "NO_ACTIVE_HOLD" | "INSUFFICIENT_STOCK" | "QUOTE_STALE" | "HOLD_EXPIRED"; skuId?: string };

export function commitCartHold(input: {
  cartId: string;
  orderRef: string;
  correlationId: string;
  quoteVersion?: number;
  enforceVersion?: boolean;
}): CommitCartHoldResult {
  const validation = validateSubmitQuote({
    cartId: input.cartId,
    quoteVersion: input.quoteVersion,
    correlationId: input.correlationId,
    enforceVersion: input.enforceVersion,
  });
  if (validation.ok === false) {
    return { ok: false, code: validation.code };
  }

  const hold = reservationLedgerState.cartHolds.get(input.cartId);
  if (!hold || hold.lines.size === 0) {
    return { ok: false, code: "NO_ACTIVE_HOLD" };
  }

  for (const [sku, qty] of hold.lines) {
    const onHand = reservationLedgerState.onHand.get(sku) ?? 0;
    if (qty > onHand) {
      return { ok: false, code: "INSUFFICIENT_STOCK", skuId: sku };
    }
  }

  for (const [sku, qty] of hold.lines) {
    appendEvent({
      skuId: sku,
      locationId: "default",
      deltaReserved: -qty,
      deltaOnHand: -qty,
      reason: "committed",
      reference: input.orderRef,
      correlationId: input.correlationId,
    });
    const nextOnHand = (reservationLedgerState.onHand.get(sku) ?? 0) - qty;
    reservationLedgerState.onHand.set(sku, nextOnHand);
  }

  if (hold.metadata?.holdId) {
    reservationLedgerState.holdIndex.delete(hold.metadata.holdId);
  }
  reservationLedgerState.cartHolds.delete(input.cartId);
  return { ok: true, correlationId: input.correlationId, orderRef: input.orderRef };
}

export function rememberIdempotentResponse(key: string, responseJson: string): void {
  reservationLedgerState.idempotency.set(key, responseJson);
}

export function getIdempotentResponse(key: string): string | undefined {
  return reservationLedgerState.idempotency.get(key);
}

export function newCorrelationId(): string {
  return randomUUID();
}

export function cleanupExpiredHolds(nowMs: number = Date.now()): number {
  const graceMs = HOLD_EXPIRY_GRACE_SECONDS * 1000;
  let removed = 0;
  for (const [cartId, hold] of reservationLedgerState.cartHolds) {
    const expiresAt = hold.metadata?.expiresAt;
    if (!expiresAt || hold.metadata?.released) {
      continue;
    }
    if (nowMs > Date.parse(expiresAt) + graceMs) {
      releaseHoldLines(cartId, newCorrelationId());
      removed += 1;
    }
  }
  return removed;
}

export function listExpiredHoldCartIds(nowMs: number = Date.now()): string[] {
  const graceMs = HOLD_EXPIRY_GRACE_SECONDS * 1000;
  const expired: string[] = [];
  for (const [cartId, hold] of reservationLedgerState.cartHolds) {
    const expiresAt = hold.metadata?.expiresAt;
    if (!expiresAt || hold.metadata?.released) {
      continue;
    }
    if (nowMs > Date.parse(expiresAt) + graceMs) {
      expired.push(cartId);
    }
  }
  return expired;
}
