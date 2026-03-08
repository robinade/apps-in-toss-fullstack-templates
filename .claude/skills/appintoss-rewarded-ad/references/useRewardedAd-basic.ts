/**
 * useFullScreenAd — Basic Hook
 *
 * Simple load/show/reload cycle with dynamic import, isSupported check, and web mock.
 * Works for both rewarded and interstitial ads (determined by adGroupId).
 * For retry/backoff/daily limits, use the production hook.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/** Detect Toss WebView environment */
const isTossApp = () =>
  typeof window !== 'undefined' &&
  !!(window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView;

interface FullScreenAdCallbacks {
  onRewarded?: (unitType: string, unitAmount: number) => void;
  onDismiss?: () => void;
  onError?: (error: Error) => void;
}

export function useFullScreenAd(adGroupId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const loadCleanupRef = useRef<(() => void) | undefined>(undefined);
  const showCleanupRef = useRef<(() => void) | undefined>(undefined);
  const callbacksRef = useRef<FullScreenAdCallbacks>({});

  const loadAd = useCallback(async () => {
    setIsLoading(true);
    setIsReady(false);

    if (!isTossApp()) {
      // Web mock: simulate 1s load
      await new Promise((r) => setTimeout(r, 1000));
      setIsLoading(false);
      setIsReady(true);
      return;
    }

    try {
      const { loadFullScreenAd } = await import('@apps-in-toss/web-framework');

      if (loadFullScreenAd.isSupported() !== true) {
        setIsLoading(false);
        return;
      }

      loadCleanupRef.current?.();

      const cleanup = loadFullScreenAd({
        options: { adGroupId },
        onEvent: (event: { type: string }) => {
          if (event.type === 'loaded') {
            setIsLoading(false);
            setIsReady(true);
          }
        },
        onError: () => {
          setIsLoading(false);
        },
      });

      loadCleanupRef.current = cleanup;
    } catch {
      setIsLoading(false);
    }
  }, [adGroupId]);

  const showAd = useCallback(
    async (callbacks: FullScreenAdCallbacks = {}) => {
      if (!isReady) return false;

      callbacksRef.current = callbacks;
      setIsShowing(true);
      setIsReady(false);

      if (!isTossApp()) {
        // Web mock: simulate 2s ad then reward
        await new Promise((r) => setTimeout(r, 2000));
        callbacksRef.current.onRewarded?.('coin', 1);
        setTimeout(() => {
          callbacksRef.current.onDismiss?.();
          setIsShowing(false);
          loadAd(); // preload next
        }, 300);
        return true;
      }

      try {
        const { showFullScreenAd } = await import('@apps-in-toss/web-framework');

        const cleanup = showFullScreenAd({
          options: { adGroupId },
          onEvent: (event: { type: string; data?: Record<string, unknown> }) => {
            if (event.type === 'userEarnedReward') {
              const unitType = (event.data?.unitType as string) ?? 'coin';
              const unitAmount = (event.data?.unitAmount as number) ?? 1;
              callbacksRef.current.onRewarded?.(unitType, unitAmount);
            }
            if (event.type === 'dismissed' || event.type === 'failedToShow') {
              if (event.type === 'failedToShow') {
                callbacksRef.current.onError?.(new Error('Ad failed to show'));
              }
              callbacksRef.current.onDismiss?.();
              setIsShowing(false);
              loadAd(); // preload next
            }
          },
          onError: (error: unknown) => {
            callbacksRef.current.onError?.(new Error(String(error)));
            setIsShowing(false);
            loadAd();
          },
        });

        showCleanupRef.current = cleanup;
        return true;
      } catch {
        setIsShowing(false);
        loadAd();
        return false;
      }
    },
    [isReady, adGroupId, loadAd],
  );

  // Auto-load on mount + cleanup on unmount
  useEffect(() => {
    loadAd();
    return () => {
      loadCleanupRef.current?.();
      showCleanupRef.current?.();
    };
  }, [loadAd]);

  return { isLoading, isReady, isShowing, loadAd, showAd };
}
