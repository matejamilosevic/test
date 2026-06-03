import type { MerchandisingFact } from "../lib/merchandising_types";
import { batchReduceMerchandisingFacts, streamReduceMerchandisingFacts } from "../lib/merchandising_accumulator";
import type { MerchandisingRollup } from "../lib/merchandising_types";

interface StoreState {
  facts: MerchandisingFact[];
  byDedupeKey: Map<string, MerchandisingFact>;
}

let state: StoreState = {
  facts: [],
  byDedupeKey: new Map(),
};

export function resetMerchandisingFactsForTests(): void {
  state = { facts: [], byDedupeKey: new Map() };
}

export function merchandisingFactDedupeKey(
  f: Pick<MerchandisingFact, "source" | "sourceId" | "lineId" | "eventType">,
): string {
  return `${f.source}::${f.sourceId}::${f.lineId}::${f.eventType}`;
}

export function ingestMerchandisingFact(fact: MerchandisingFact): { inserted: boolean; fact: MerchandisingFact } {
  const key = merchandisingFactDedupeKey(fact);
  const existing = state.byDedupeKey.get(key);
  if (existing) {
    return { inserted: false, fact: existing };
  }
  state.byDedupeKey.set(key, fact);
  state.facts.push(fact);
  return { inserted: true, fact };
}

export function listMerchandisingFactsFiltered(input: { asOfIso: string; currency: string }): MerchandisingFact[] {
  return state.facts.filter((f) => f.currency === input.currency && f.occurredAt <= input.asOfIso);
}

export function computeMerchandisingRollup(input: { asOfIso: string; currency: string }): MerchandisingRollup {
  const filtered = listMerchandisingFactsFiltered(input);
  return batchReduceMerchandisingFacts(filtered, input.asOfIso, input.currency);
}

export function computeMerchandisingRollupStreamed(input: { asOfIso: string; currency: string }): MerchandisingRollup {
  const filtered = listMerchandisingFactsFiltered(input);
  return streamReduceMerchandisingFacts(filtered, input.asOfIso, input.currency);
}

export function allMerchandisingFacts(): readonly MerchandisingFact[] {
  return state.facts;
}
