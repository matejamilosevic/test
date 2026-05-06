import { randomUUID } from "node:crypto";

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

interface MutableCartHold {
  lines: Map<string, number>;
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
  idempotency: Map<string, string>;
} = {
  events: [],
  onHand: new Map(),
  cartHolds: new Map(),
  idempotency: new Map(),
};

export function resetReservationLedgerForTests(): void {
  reservationLedgerState = {
    events: [],
    onHand: new Map(),
    cartHolds: new Map(),
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

export type ReserveCartHoldResult =
  | { ok: true; correlationId: string }
  | { ok: false; code: "INSUFFICIENT_STOCK"; skuId: string };

export function reserveCartHold(input: {
  cartId: string;
  lines: CartLine[];
  correlationId: string;
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

  if (nextMap.size === 0) {
    reservationLedgerState.cartHolds.delete(cartId);
  } else {
    reservationLedgerState.cartHolds.set(cartId, { lines: nextMap });
  }

  return { ok: true, correlationId };
}

export type CommitCartHoldResult =
  | { ok: true; correlationId: string; orderRef: string }
  | { ok: false; code: "NO_ACTIVE_HOLD" | "INSUFFICIENT_STOCK"; skuId?: string };

export function commitCartHold(input: { cartId: string; orderRef: string; correlationId: string }): CommitCartHoldResult {
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

  reservationLedgerState.cartHolds.delete(input.cartId);
  return { ok: true, correlationId: input.correlationId, orderRef: input.orderRef };
}

export function releaseCartHold(input: { cartId: string; correlationId: string }): void {
  const hold = reservationLedgerState.cartHolds.get(input.cartId);
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
      reference: input.cartId,
      correlationId: input.correlationId,
    });
  }
  reservationLedgerState.cartHolds.delete(input.cartId);
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
