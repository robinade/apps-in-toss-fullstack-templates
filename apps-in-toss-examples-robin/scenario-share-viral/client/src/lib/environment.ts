export type AppEnvironment = 'web' | 'toss' | 'sandbox';

let _cachedEnv: AppEnvironment = 'web';

// 앱 시작 시 환경 감지 (dynamic import + 캐시)
(async () => {
  try {
    const { getOperationalEnvironment } = await import('@apps-in-toss/web-framework');
    _cachedEnv = getOperationalEnvironment() as AppEnvironment;
  } catch {
    _cachedEnv = 'web';
  }
})();

/** 환경 반환 (동기). 초기화 전에는 'web' 반환. */
export function getEnvironment(): AppEnvironment {
  return _cachedEnv;
}

export function isTossApp(): boolean {
  return _cachedEnv !== 'web';
}
