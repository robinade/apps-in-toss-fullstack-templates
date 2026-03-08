/**
 * useFullScreenAd — Production Hook
 *
 * Features: load queue (one at a time), retry with exponential backoff,
 * load timeout, daily ad limit, module-level SDK cache.
 * Works for both rewarded and interstitial ads.
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { AD_CONFIG, delay, getBackoffDelay } from '../lib/constants';

// --- SDK Type Definitions ---

interface LoadFullScreenAdParams {
  options: { adGroupId: string };
  onEvent: (event: { type: 'loaded' }) => void;
  onError: (error: unknown) => void;
}

type ShowFullScreenAdEvent =
  | { type: 'requested' }
  | { type: 'show' }
  | { type: 'impression' }
  | { type: 'clicked' }
  | { type: 'dismissed' }
  | { type: 'failedToShow' }
  | { type: 'userEarnedReward'; data: { unitType: string; unitAmount: number } };

interface ShowFullScreenAdParams {
  options: { adGroupId: string };
  onEvent: (event: ShowFullScreenAdEvent) => void;
  onError: (error: unknown) => void;
}

type LoadFn = { (p: LoadFullScreenAdParams): () => void; isSupported: () => boolean };
type ShowFn = { (p: ShowFullScreenAdParams): () => void; isSupported: () => boolean };

// --- Module-level SDK Cache ---

let _loadFn: LoadFn | null = null;
let _showFn: ShowFn | null = null;

// --- Load Queue (one ad at a time) ---

let _loading = false;
const _queue: Array<() => void> = [];

function enqueue(fn: () => void) {
  if (!_loading) { _loading = true; fn(); }
  else { _queue.push(fn); }
}

function dequeue() {
  _loading = false;
  if (_queue.length > 0) { _loading = true; _queue.shift()!(); }
}

// --- Environment Detection ---

const isTossApp = () =>
  typeof window !== 'undefined' &&
  !!(window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView;

// --- Callbacks Interface ---

interface FullScreenAdCallbacks {
  onRewarded?: (unitType: string, unitAmount: number) => void;
  onDismiss?: () => void;
  onError?: (error: Error) => void;
}

// --- Hook ---

export function useFullScreenAd(adGroupId: string) {
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [adViewCount, setAdViewCount] = useState(0);
  const loadCleanupRef = useRef<(() => void) | undefined>(undefined);
  const showCleanupRef = useRef<(() => void) | undefined>(undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const callbacksRef = useRef<FullScreenAdCallbacks>({});

  const checkSupport = useCallback(async (): Promise<boolean> => {
    if (!isTossApp()) return false;
    try {
      if (!_loadFn || !_showFn) {
        const sdk = await import('@apps-in-toss/web-framework');
        _loadFn = (sdk as unknown as { loadFullScreenAd: LoadFn }).loadFullScreenAd;
        _showFn = (sdk as unknown as { showFullScreenAd: ShowFn }).showFullScreenAd;
      }
      return !!_loadFn && !!_showFn && _loadFn.isSupported() && _showFn.isSupported();
    } catch {
      return false;
    }
  }, []);

  const loadAd = useCallback(async (retryAttempt = 0) => {
    const doLoad = async () => {
      setLoading(true);
      setIsReady(false);
      const supported = await checkSupport();

      if (!supported) {
        if (import.meta.env.DEV) {
          // Web mock
          await delay(1000);
          setLoading(false);
          setIsReady(true);
          setRetryCount(0);
          dequeue();
          return;
        }
        setLoading(false);
        dequeue();
        return;
      }

      loadCleanupRef.current?.();
      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setLoading(false);
        dequeue();
      }, AD_CONFIG.LOAD_TIMEOUT_MS);

      const cleanup = _loadFn!({
        options: { adGroupId },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            clearTimeout(timeoutRef.current);
            setLoading(false);
            setIsReady(true);
            setRetryCount(0);
            dequeue();
          }
        },
        onError: async (error) => {
          clearTimeout(timeoutRef.current);

          if (retryAttempt < AD_CONFIG.MAX_RETRIES - 1) {
            const ms = getBackoffDelay(retryAttempt);
            await delay(ms);
            setRetryCount(retryAttempt + 1);
            loadAd(retryAttempt + 1);
          } else {
            setLoading(false);
            callbacksRef.current.onError?.(new Error(String(error)));
            dequeue();
          }
        },
      });

      loadCleanupRef.current = cleanup;
    };

    if (retryAttempt === 0) enqueue(doLoad);
    else await doLoad();
  }, [checkSupport, adGroupId]);

  useEffect(() => {
    loadAd();
    return () => {
      loadCleanupRef.current?.();
      showCleanupRef.current?.();
    };
  }, [loadAd]);

  const showAd = useCallback(async (callbacks: FullScreenAdCallbacks): Promise<boolean> => {
    if (loading || !isReady) return false;

    if (adViewCount >= AD_CONFIG.MAX_DAILY_ADS) {
      callbacks.onError?.(new Error('일일 광고 시청 제한'));
      return false;
    }

    callbacksRef.current = callbacks;
    const supported = await checkSupport();

    if (!supported) {
      if (import.meta.env.DEV) {
        setIsReady(false);
        setTimeout(() => {
          setAdViewCount((c) => c + 1);
          callbacksRef.current.onRewarded?.('coin', 1);
          setTimeout(() => {
            callbacksRef.current.onDismiss?.();
            loadAd();
          }, 500);
        }, 2000);
        return true;
      }
      return false;
    }

    setIsReady(false);
    const cleanup = _showFn!({
      options: { adGroupId },
      onEvent: (event) => {
        switch (event.type) {
          case 'impression':
            setAdViewCount((c) => c + 1);
            break;
          case 'userEarnedReward':
            callbacksRef.current.onRewarded?.(event.data.unitType, event.data.unitAmount);
            break;
          case 'dismissed':
            callbacksRef.current.onDismiss?.();
            loadAd();
            break;
          case 'failedToShow':
            callbacksRef.current.onError?.(new Error('광고 표시 실패'));
            loadAd();
            break;
        }
      },
      onError: (error) => {
        callbacksRef.current.onError?.(new Error(String(error)));
        loadAd();
      },
    });
    showCleanupRef.current = cleanup;
    return true;
  }, [loading, isReady, adViewCount, checkSupport, adGroupId, loadAd]);

  return {
    loading,
    isReady,
    retryCount,
    adViewCount,
    remainingAds: AD_CONFIG.MAX_DAILY_ADS - adViewCount,
    loadAd: () => loadAd(0),
    showAd,
  };
}
