import { useCallback, useEffect, useState } from 'react';
import { TossAds, type TossAdsAttachBannerOptions } from '@apps-in-toss/web-framework';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

let _initialized = false;
let _initializing = false;

export function useBannerAd() {
  const [isInitialized, setIsInitialized] = useState(_initialized);
  const { addEvent } = useEventLogStore();

  useEffect(() => {
    if (_initialized) { setIsInitialized(true); return; }
    if (_initializing || !isTossApp()) return;
    if (!TossAds.initialize.isSupported()) {
      addEvent('banner_sdk_not_supported');
      return;
    }

    _initializing = true;
    addEvent('banner_sdk_initializing');

    TossAds.initialize({
      callbacks: {
        onInitialized: () => {
          _initialized = true;
          _initializing = false;
          setIsInitialized(true);
          addEvent('banner_sdk_initialized');
        },
        onInitializationFailed: (error) => {
          _initializing = false;
          addEvent('banner_sdk_init_failed', { error: String(error) });
        },
      },
    });
  }, [addEvent]);

  const attachBanner = useCallback(
    (adGroupId: string, element: HTMLElement, options?: TossAdsAttachBannerOptions) => {
      if (!isInitialized) return;
      addEvent('banner_attach', { adGroupId });
      return TossAds.attachBanner(adGroupId, element, options);
    },
    [isInitialized, addEvent],
  );

  return { isInitialized, attachBanner };
}
