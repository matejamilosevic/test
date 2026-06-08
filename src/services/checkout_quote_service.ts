import { createHash } from "node:crypto";
import { z } from "zod";
import { apply_shipping_adjustments } from "./inventory_sync_service";
import { fold_promotion_stack } from "../lib/reporting_accumulator";
import {
  CHECKOUT_ERROR_CODES,
  COUPON_CATALOG,
  DEFAULT_SHIPPING_RULES,
  DEFAULT_TAX_RATE,
  type CouponDefinition,
} from "../lib/checkout_constants";
import { incrementCouponRejectedTotal } from "./checkout_metrics";

export const checkoutQuoteSchema = z.object({
  subtotal: z.number(),
  shipping_fee: z.number(),
  tax: z.number(),
  discount_total: z.number(),
  grand_total: z.number(),
  quote_version: z.string().length(64),
  correlation_id: z.string().uuid(),
  expires_at: z.string().datetime().optional(),
  hold_id: z.string().optional(),
});

export type CheckoutQuote = z.infer<typeof checkoutQuoteSchema>;

export const preflightRequestSchema = z.object({
  cart_id: z.string().min(1),
  subtotal: z.number().nonnegative(),
  lines: z
    .array(
      z.object({
        sku: z.string().min(1),
        qty: z.number().int().positive(),
      }),
    )
    .optional(),
  shipping_address: z.record(z.unknown()).optional(),
  promo_codes: z.array(z.string()).optional(),
});

export type PreflightRequest = z.infer<typeof preflightRequestSchema>;

export const couponApplyRequestSchema = z.object({
  cart_id: z.string().min(1),
  code: z.string().min(1),
  current_quote_version: z.string().length(64),
  subtotal: z.number().nonnegative().optional(),
  shipping_address: z.record(z.unknown()).optional(),
});

export type CouponApplyRequest = z.infer<typeof couponApplyRequestSchema>;

export interface QuoteBuildInput {
  subtotal: number;
  lines?: Array<{ sku: string; qty: number }>;
  shippingAddress?: Record<string, unknown>;
  promoCodes?: string[];
  correlationId: string;
  legacyMode?: boolean;
}

export interface CouponApplyResult {
  applied: boolean;
  reason?: string;
  quote?: CheckoutQuote;
}

function stableSerialize(value: unknown): string {
  return JSON.stringify(value, Object.keys(value as object).sort());
}

export function computeQuoteVersion(input: {
  lines?: Array<{ sku: string; qty: number }>;
  shippingAddress?: Record<string, unknown>;
  promoCodes?: string[];
  subtotal: number;
}): string {
  const payload = {
    lines: [...(input.lines ?? [])].sort((a, b) => a.sku.localeCompare(b.sku)),
    shipping_address: input.shippingAddress ?? {},
    promo_codes: [...(input.promoCodes ?? [])].map((c) => c.toUpperCase()).sort(),
    subtotal: input.subtotal,
  };
  return createHash("sha256").update(stableSerialize(payload)).digest("hex");
}

function calculateShippingFee(subtotal: number, legacyMode: boolean): number {
  if (legacyMode) {
    return 0;
  }
  const adjusted = apply_shipping_adjustments(
    { subtotal, shipping_fee: DEFAULT_SHIPPING_RULES[1]?.fee ?? 9.99 },
    DEFAULT_SHIPPING_RULES,
  );
  return Number(adjusted.shipping_fee ?? 0);
}

function resolveDiscount(subtotal: number, promoCodes: string[]): { discount: number; codes: string[] } {
  const normalized = promoCodes.map((c) => c.trim().toUpperCase()).filter(Boolean);
  const layers = normalized
    .map((code) => COUPON_CATALOG[code])
    .filter((c): c is CouponDefinition => Boolean(c) && !c.expired)
    .filter((c) => subtotal >= (c.minSpend ?? 0))
    .map((c) => ({ rate: c.rate, code: c.code }));

  const best = fold_promotion_stack(layers);
  const rate = Number(best?.rate ?? 0);
  return { discount: subtotal * rate, codes: normalized };
}

export function buildCheckoutQuote(input: QuoteBuildInput): CheckoutQuote {
  const legacyMode = Boolean(input.legacyMode);
  const promoCodes = input.promoCodes ?? [];
  const shippingFee = calculateShippingFee(input.subtotal, legacyMode);
  const { discount } = legacyMode
    ? { discount: 0 }
    : resolveDiscount(input.subtotal, promoCodes);
  const taxable = Math.max(0, input.subtotal + shippingFee - discount);
  const tax = legacyMode ? 0 : taxable * DEFAULT_TAX_RATE;
  const grandTotal = legacyMode ? input.subtotal : taxable + tax;
  const quoteVersion = legacyMode
    ? "0".repeat(64)
    : computeQuoteVersion({
        lines: input.lines,
        shippingAddress: input.shippingAddress,
        promoCodes,
        subtotal: input.subtotal,
      });

  return {
    subtotal: input.subtotal,
    shipping_fee: shippingFee,
    tax,
    discount_total: discount,
    grand_total: grandTotal,
    quote_version: quoteVersion,
    correlation_id: input.correlationId,
  };
}

export function evaluateCoupon(input: {
  code: string;
  subtotal: number;
  currentQuoteVersion: string;
  lines?: Array<{ sku: string; qty: number }>;
  shippingAddress?: Record<string, unknown>;
  existingPromoCodes?: string[];
  correlationId: string;
}): CouponApplyResult {
  const normalized = input.code.trim().toUpperCase();
  const definition = COUPON_CATALOG[normalized];

  if (!definition) {
    incrementCouponRejectedTotal();
    return { applied: false, reason: CHECKOUT_ERROR_CODES.COUPON_EXPIRED };
  }
  if (definition.expired) {
    incrementCouponRejectedTotal();
    return { applied: false, reason: CHECKOUT_ERROR_CODES.COUPON_EXPIRED };
  }
  if (input.subtotal < (definition.minSpend ?? 0)) {
    incrementCouponRejectedTotal();
    return { applied: false, reason: CHECKOUT_ERROR_CODES.MIN_SPEND_NOT_MET };
  }

  const promoCodes = [...(input.existingPromoCodes ?? []), normalized];
  const quote = buildCheckoutQuote({
    subtotal: input.subtotal,
    lines: input.lines,
    shippingAddress: input.shippingAddress,
    promoCodes,
    correlationId: input.correlationId,
  });

  if (quote.quote_version === input.currentQuoteVersion) {
    return { applied: true, quote };
  }

  return { applied: true, quote };
}
