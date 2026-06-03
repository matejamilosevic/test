export interface ProfileConfig {
  profileRetryUxEnabled: boolean;
}

const defaultConfig: ProfileConfig = {
  profileRetryUxEnabled: process.env.ENABLE_PROFILE_RETRY_UX === "true",
};

let activeConfig: ProfileConfig = { ...defaultConfig };

export function getProfileConfig(): Readonly<ProfileConfig> {
  return activeConfig;
}

export function setProfileConfigForTests(partial: Partial<ProfileConfig>): void {
  activeConfig = { ...activeConfig, ...partial };
}

export function resetProfileConfigForTests(): void {
  activeConfig = { ...defaultConfig };
}

export function isProfileRetryUxEnabled(): boolean {
  return activeConfig.profileRetryUxEnabled;
}

export const PROFILE_FEATURE_GATES = {
  PROFILE_RETRY_UX: "enable_profile_retry_ux",
} as const;
