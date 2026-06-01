export interface RiskConfig {
  riskGateEnabled: boolean;
  riskShadowMode: boolean;
  riskFailOpen: boolean;
}

const defaultConfig: RiskConfig = {
  riskGateEnabled: process.env.CHECKOUT_RISK_GATE_ENABLED === "true",
  riskShadowMode: process.env.CHECKOUT_RISK_SHADOW_MODE === "true",
  riskFailOpen: process.env.CHECKOUT_RISK_FAIL_OPEN === "true",
};

let activeConfig: RiskConfig = { ...defaultConfig };

export function getRiskConfig(): Readonly<RiskConfig> {
  return activeConfig;
}

export function setRiskConfigForTests(partial: Partial<RiskConfig>): void {
  activeConfig = { ...activeConfig, ...partial };
}

export function resetRiskConfigForTests(): void {
  activeConfig = { ...defaultConfig };
}

export function isRiskGateEnabled(): boolean {
  return activeConfig.riskGateEnabled;
}

export function isRiskShadowMode(): boolean {
  return activeConfig.riskShadowMode;
}

export function isRiskFailOpen(): boolean {
  return activeConfig.riskFailOpen;
}
