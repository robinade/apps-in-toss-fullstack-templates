/**
 * Ad Configuration Constants
 *
 * Shared config for production rewarded/interstitial ad hooks.
 */

export const AD_CONFIG = {
  /** Maximum retry attempts on load failure */
  MAX_RETRIES: 3,
  /** Base delay for exponential backoff (ms) */
  RETRY_DELAY_BASE_MS: 1000,
  /** Timeout for a single load attempt (ms) */
  LOAD_TIMEOUT_MS: 15000,
  /** Maximum ads per session/day */
  MAX_DAILY_ADS: 80,
} as const;

/**
 * Test IDs (official):
 *   보상형: ait-ad-test-rewarded-id
 *   전면형: ait-ad-test-interstitial-id
 *
 * Replace with production IDs from AppsInToss console.
 * Production IDs take up to 2 hours to register with Google after creation.
 */
export const AD_GROUP_IDS = {
  REWARDED: import.meta.env.VITE_REWARDED_AD_GROUP_ID || 'ait-ad-test-rewarded-id',
  INTERSTITIAL: import.meta.env.VITE_INTERSTITIAL_AD_GROUP_ID || 'ait-ad-test-interstitial-id',
} as const;

/** Exponential backoff: 1s, 2s, 4s, ... */
export function getBackoffDelay(attempt: number): number {
  return AD_CONFIG.RETRY_DELAY_BASE_MS * Math.pow(2, attempt);
}

/** Promise-based delay */
export function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
