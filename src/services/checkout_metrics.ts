let quoteLatenciesMs: number[] = [];
let holdExpiredTotal = 0;
let quoteStaleTotal = 0;

export function recordCheckoutQuoteLatency(ms: number): void {
  quoteLatenciesMs.push(ms);
}

export function incrementHoldExpiredTotal(): void {
  holdExpiredTotal += 1;
}

export function incrementQuoteStaleTotal(): void {
  quoteStaleTotal += 1;
}

export function getCheckoutMetrics(): {
  checkout_quote_latency_samples: number[];
  hold_expired_total: number;
  quote_stale_total: number;
} {
  return {
    checkout_quote_latency_samples: [...quoteLatenciesMs],
    hold_expired_total: holdExpiredTotal,
    quote_stale_total: quoteStaleTotal,
  };
}

export function resetCheckoutMetricsForTests(): void {
  quoteLatenciesMs = [];
  holdExpiredTotal = 0;
  quoteStaleTotal = 0;
}
