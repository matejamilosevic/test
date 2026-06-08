import { z } from "zod";
import { apply_shipping_adjustments } from "./inventory_sync_service";
import {
  CHECKOUT_ERROR_CODES,
  COUPON_CATALOG,
  DEFAULT_SHIPPING_RULES,
  DEFAULT_TAX_RATE,
  type CouponDefinition,
} from "../lib/checkout_constants";

export const checkoutQuoteSchema = z.object({
  subtotal: z.number(),
  shipping_fee: z.number(),
  tax: z.number(),
  discount_total: z.number(),
  grand_total: z.number(),
  quote_version: z.number().int().positive(),
  correlation_id: z.string().uuid(),
  expires_at: z.string().datetime().optional(),
  hold_id: z.string().optional(),
});

export type CheckoutQuote = z.infer<typeof checkoutQuoteSchema>;

export const couponApplyRequestSchema = z.object({
  cart_id: z.string().min(1),
  code: z.string().min(1),
  subtotal: z.number().nonnegative().optional(),
});

export type CouponApplyRequest = z.infer<typeof couponApplyRequestSchema>;

export interface QuoteBuildInput {
  subtotal: number;
  promoCodes?: string[];
  correlationId: string;
  quoteVersion?: number;
  legacyMode?: boolean;
}

export interface CouponApplyResult {
  ok: boolean;
  code?: string;
  quote?: CheckoutQuote;
}

function calculateShippingFee(subtotal: number, legacyMode: boolean): number {
  if (legacyMode || subtotal <= 0) {
    return 0;
  }
  const adjusted = apply_shipping_adjustments(
    { subtotal, shipping_fee: DEFAULT_SHIPPING_RULES[1]?.fee ?? 5 },
    DEFAULT_SHIPPING_RULES,
  );
  return Number(adjusted.shipping_fee ?? 0);
}

function resolveDiscount(subtotal: number, promoCodes: string[]): number {
  const normalized = promoCodes.map((c) => c.trim().toUpperCase()).filter(Boolean);
  let bestRate = 0;
  for (const code of normalized) {
    const definition = COUPON_CATALOG[code];
    if (!definition || definition.expired) {
      continue;
    }
    if (subtotal < (definition.minSpend ?? 0)) {
      continue;
    }
    bestRate = Math.max(bestRate, definition.rate);
  }
  return subtotal * bestRate;
}

export function buildCheckoutQuote(input: QuoteBuildInput): CheckoutQuote {
  const legacyMode = Boolean(input.legacyMode);
  const promoCodes = input.promoCodes ?? [];
  const shippingFee = calculateShippingFee(input.subtotal, legacyMode);
  const discount = legacyMode ? 0 : resolveDiscount(input.subtotal, promoCodes);
  const taxable = Math.max(0, input.subtotal + shippingFee - discount);
  const tax = legacyMode ? 0 : taxable * DEFAULT_TAX_RATE;
  const grandTotal = legacyMode ? input.subtotal : taxable + tax;

  return {
    subtotal: input.subtotal,
    shipping_fee: shippingFee,
    tax,
    discount_total: discount,
    grand_total: grandTotal,
    quote_version: input.quoteVersion ?? 1,
    correlation_id: input.correlationId,
  };
}

export function evaluateCoupon(input: {
  code: string;
  subtotal: number;
  currentQuoteVersion: number;
  promoCodes?: string[];
  correlationId: string;
}): CouponApplyResult {
  const normalized = input.code.trim().toUpperCase();
  const definition = COUPON_CATALOG[normalized];

  if (!definition) {
    return { ok: false, code: CHECKOUT_ERROR_CODES.COUPON_EXPIRED };
  }
  if (definition.expired) {
    return { ok: false, code: CHECKOUT_ERROR_CODES.COUPON_EXPIRED };
  }
  if (input.subtotal < (definition.minSpend ?? 0)) {
    return { ok: false, code: CHECKOUT_ERROR_CODES.MIN_SPEND_NOT_MET };
  }

  const promoCodes = [...(input.promoCodes ?? []), normalized];
  const quote = buildCheckoutQuote({
    subtotal: input.subtotal,
    promoCodes,
    correlationId: input.correlationId,
    quoteVersion: input.currentQuoteVersion + 1,
  });

  return { ok: true, quote };
}

export function validateCouponDefinition(code: string, subtotal: number): { ok: true; definition: CouponDefinition } | { ok: false; code: string } {
  const normalized = code.trim().toUpperCase();
  const definition = COUPON_CATALOG[normalized];
  if (!definition) {
    return { ok: false, code: CHECKOUT_ERROR_CODES.COUPON_EXPIRED };
  }
  if (definition.expired) {
    return { ok: false, code: CHECKOUT_ERROR_CODES.COUPON_EXPIRED };
  }
  if (subtotal < (definition.minSpend ?? 0)) {
    return { ok: false, code: CHECKOUT_ERROR_CODES.MIN_SPEND_NOT_MET };
  }
  return { ok: true, definition };
}
