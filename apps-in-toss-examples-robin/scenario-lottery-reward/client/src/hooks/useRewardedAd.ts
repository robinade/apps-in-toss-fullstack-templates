import { useState, useCallback, useRef, useEffect } from 'react';
import { getEnvironment } from '../lib/environment';
import { useAppStore } from '../stores/appStore';

const AD_GROUP_ID = import.meta.env.VITE_AD_GROUP_ID || 'test-ad-group-id';

export function useRewardedAd() {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const loadCleanupRef = useRef<(() => void) | undefined>(undefined);
  const showCleanupRef = useRef<(() => void) | undefined>(undefined);
  const onRewardedRef = useRef<((amount: number) => void) | undefined>(undefined);
  const addEvent = useAppStore((s) => s.addEvent);
  const env = getEnvironment();

  const loadAd = useCallback(async () => {
    setIsLoading(true);
    setIsReady(false);
    addEvent('ad_load_started', {});

    if (env === 'web') {
      await new Promise((r) => setTimeout(r, 1000));
      setIsLoading(false);
      setIsReady(true);
      setIsSupported(true);
      addEvent('ad_loaded', { environment: 'mock' });
      return;
    }

    try {
      const { loadFullScreenAd } = await import('@apps-in-toss/web-framework');
      if (loadFullScreenAd.isSupported() !== true) {
        addEvent('ad_not_supported', {});
        setIsLoading(false);
        return;
      }
      setIsSupported(true);
      loadCleanupRef.current?.();
      const cleanup = loadFullScreenAd({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (event: { type: string }) => {
          if (event.type === 'loaded') {
            setIsLoading(false);
            setIsReady(true);
            addEvent('ad_loaded', {});
          }
        },
        onError: (error: unknown) => {
          setIsLoading(false);
          addEvent('ad_load_error', { error: String(error) });
        },
      });
      loadCleanupRef.current = cleanup;
    } catch {
      setIsLoading(false);
      addEvent('ad_sdk_error', {});
    }
  }, [env, addEvent]);

  const showAd = useCallback(async () => {
    if (!isReady) return;
    setIsShowing(true);
    setIsReady(false);
    addEvent('ad_show_started', {});

    if (env === 'web') {
      await new Promise((r) => setTimeout(r, 2000));
      const reward = 1;
      addEvent('ad_rewarded', { amount: reward, environment: 'mock' });
      onRewardedRef.current?.(reward);
      setIsShowing(false);
      loadAd();
      return;
    }

    try {
      const { showFullScreenAd } = await import('@apps-in-toss/web-framework');
      const cleanup = showFullScreenAd({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (event: { type: string; data?: Record<string, unknown> }) => {
          addEvent(`ad_${event.type}`, event.data);
          if (event.type === 'userEarnedReward') {
            const amount = (event.data?.unitAmount as number) ?? 1;
            onRewardedRef.current?.(amount);
          }
          if (event.type === 'dismissed' || event.type === 'failedToShow') {
            setIsShowing(false);
            loadAd();
          }
        },
        onError: (error: unknown) => {
          addEvent('ad_show_error', { error: String(error) });
          setIsShowing(false);
          loadAd();
        },
      });
      showCleanupRef.current = cleanup;
    } catch {
      setIsShowing(false);
      loadAd();
    }
  }, [isReady, env, addEvent, loadAd]);

  useEffect(() => {
    loadAd();
    return () => {
      loadCleanupRef.current?.();
      showCleanupRef.current?.();
    };
  }, [loadAd]);

  return {
    isLoading, isReady, isShowing, isSupported, loadAd, showAd,
    set onRewarded(cb: ((amount: number) => void) | undefined) { onRewardedRef.current = cb; },
  };
}
