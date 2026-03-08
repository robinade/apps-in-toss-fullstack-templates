export const AD_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE_MS: 1000,
  LOAD_TIMEOUT_MS: 15000,
  MAX_DAILY_ADS: 80,
} as const;

export const AD_GROUP_IDS = {
  REWARDED: import.meta.env.DEV
    ? 'ait-ad-test-rewarded-id'
    : '<YOUR_PRODUCTION_AD_GROUP_ID>',
} as const;

export function getBackoffDelay(attempt: number): number {
  return AD_CONFIG.RETRY_DELAY_BASE_MS * Math.pow(2, attempt);
}

export function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
