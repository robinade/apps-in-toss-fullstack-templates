import { getOperationalEnvironment } from '@apps-in-toss/web-framework';

export type AppEnvironment = 'web' | 'toss' | 'sandbox';

let _cachedEnv: AppEnvironment | null = null;

export function getEnvironment(): AppEnvironment {
  if (_cachedEnv) return _cachedEnv;
  try {
    _cachedEnv = getOperationalEnvironment() as AppEnvironment;
  } catch {
    _cachedEnv = 'web';
  }
  return _cachedEnv;
}

export function isTossApp(): boolean {
  return getEnvironment() !== 'web';
}
