let quoteLatenciesMs: number[] = [];
let holdExpiredTotal = 0;
let couponRejectedTotal = 0;

export function recordCheckoutQuoteLatency(ms: number): void {
  quoteLatenciesMs.push(ms);
}

export function incrementHoldExpiredTotal(): void {
  holdExpiredTotal += 1;
}

export function incrementCouponRejectedTotal(): void {
  couponRejectedTotal += 1;
}

export function getCheckoutMetrics(): {
  checkout_quote_latency_samples: number[];
  hold_expired_total: number;
  coupon_rejected_total: number;
} {
  return {
    checkout_quote_latency_samples: [...quoteLatenciesMs],
    hold_expired_total: holdExpiredTotal,
    coupon_rejected_total: couponRejectedTotal,
  };
}

export function resetCheckoutMetricsForTests(): void {
  quoteLatenciesMs = [];
  holdExpiredTotal = 0;
  couponRejectedTotal = 0;
}
