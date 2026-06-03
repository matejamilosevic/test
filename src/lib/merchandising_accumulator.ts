import type { MerchandisingFact, MerchandisingRollup } from "./merchandising_types";

export function reduceMerchandisingFacts(sortedFacts: MerchandisingFact[], asOfIso: string, currency: string): MerchandisingRollup {
  const rollup: MerchandisingRollup = {
    asOf: asOfIso,
    currency,
    gmvMinor: 0,
    discountMinor: 0,
    shippingMinor: 0,
    taxMinor: 0,
    refundMinor: 0,
    netRevenueMinor: 0,
    byChannel: {},
  };

  for (const f of sortedFacts) {
    if (f.currency !== currency) {
      continue;
    }
    const ch = f.channel || "unknown";
    if (!rollup.byChannel[ch]) {
      rollup.byChannel[ch] = { gmvMinor: 0 };
    }
    const minor = Math.trunc(f.amountMinor);
    switch (f.category) {
      case "gmv":
        rollup.gmvMinor += minor;
        rollup.byChannel[ch].gmvMinor += minor;
        break;
      case "discount":
        rollup.discountMinor += minor;
        break;
      case "shipping":
        rollup.shippingMinor += minor;
        break;
      case "tax":
        rollup.taxMinor += minor;
        break;
      case "refund":
        rollup.refundMinor += minor;
        break;
      default:
        break;
    }
  }

  rollup.netRevenueMinor = rollup.gmvMinor - rollup.discountMinor + rollup.shippingMinor - rollup.refundMinor;

  return rollup;
}

export function streamReduceMerchandisingFacts(facts: MerchandisingFact[], asOfIso: string, currency: string): MerchandisingRollup {
  return reduceMerchandisingFacts(facts, asOfIso, currency);
}

export function batchReduceMerchandisingFacts(facts: MerchandisingFact[], asOfIso: string, currency: string): MerchandisingRollup {
  const sorted = [...facts].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  return reduceMerchandisingFacts(sorted, asOfIso, currency);
}
