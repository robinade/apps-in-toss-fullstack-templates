import { useState, useEffect, useCallback } from 'react';
import { getEnvironment, type AppEnvironment } from '../lib/environment';

interface EnvironmentInfo {
  environment: AppEnvironment;
  isTossApp: boolean;
  isSandbox: boolean;
  isWeb: boolean;
  userAgent: string;
  hasReactNativeWebView: boolean;
  windowSize: { width: number; height: number };
}

export function useEnvironment() {
  const [info, setInfo] = useState<EnvironmentInfo | null>(null);

  const detect = useCallback(() => {
    const env = getEnvironment();
    const win = window as Record<string, unknown>;

    setInfo({
      environment: env,
      isTossApp: env !== 'web',
      isSandbox: env === 'sandbox',
      isWeb: env === 'web',
      userAgent: navigator.userAgent,
      hasReactNativeWebView: typeof win.ReactNativeWebView !== 'undefined',
      windowSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }, []);

  useEffect(() => {
    detect();
    window.addEventListener('resize', detect);
    return () => window.removeEventListener('resize', detect);
  }, [detect]);

  return { info, refresh: detect };
}
