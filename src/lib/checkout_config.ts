import { DEFAULT_HOLD_TTL_SECONDS } from "./checkout_constants";

export interface CheckoutConfig {
  commercialPipelineEnabled: boolean;
  holdTtlSeconds: number;
}

const defaultConfig: CheckoutConfig = {
  commercialPipelineEnabled: process.env.CHECKOUT_COMMERCIAL_PIPELINE_V1 !== "false",
  holdTtlSeconds: Number(process.env.HOLD_TTL_SECONDS ?? DEFAULT_HOLD_TTL_SECONDS),
};

let activeConfig: CheckoutConfig = { ...defaultConfig };

export function getCheckoutConfig(): Readonly<CheckoutConfig> {
  return activeConfig;
}

export function setCheckoutConfigForTests(partial: Partial<CheckoutConfig>): void {
  activeConfig = { ...activeConfig, ...partial };
}

export function resetCheckoutConfigForTests(): void {
  activeConfig = { ...defaultConfig };
}

export function isCommercialPipelineEnabled(): boolean {
  return activeConfig.commercialPipelineEnabled;
}

export function getHoldTtlSeconds(): number {
  return activeConfig.holdTtlSeconds;
}
