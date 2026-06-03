const PAN_PATTERN = /\b(?:\d[ -]*?){13,19}\b/g;
const CVV_PATTERN = /\b(?:cvv|cvc|security code)[:\s]*\d{3,4}\b/gi;

export function scrubRiskInput(input: Record<string, unknown>): Record<string, unknown> {
  const clone = structuredClone(input) as Record<string, unknown>;

  if (typeof clone.gift_message === "string") {
    clone.gift_message = "[REDACTED_GIFT_MESSAGE]";
  }

  if (clone.session_metadata && typeof clone.session_metadata === "object") {
    clone.session_metadata = scrubNested(clone.session_metadata as Record<string, unknown>);
  }

  if (typeof clone.payment_method === "string") {
    clone.payment_method = scrubString(clone.payment_method);
  }

  return clone;
}

function scrubNested(value: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === "string") {
      out[key] = scrubString(raw);
    } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      out[key] = scrubNested(raw as Record<string, unknown>);
    } else {
      out[key] = raw;
    }
  }
  return out;
}

function scrubString(value: string): string {
  return value.replace(PAN_PATTERN, "[REDACTED_PAN]").replace(CVV_PATTERN, "[REDACTED_CVV]");
}

export function containsPan(value: string): boolean {
  return PAN_PATTERN.test(value.replace(/ /g, ""));
}
