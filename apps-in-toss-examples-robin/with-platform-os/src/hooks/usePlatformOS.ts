import { useCallback, useState, useEffect } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

type PlatformOS = 'ios' | 'android' | 'unknown';

interface PlatformInfo {
  os: PlatformOS;
  isIOS: boolean;
  isAndroid: boolean;
  version: string;
}

export function usePlatformOS() {
  const [platform, setPlatform] = useState<PlatformInfo | null>(null);
  const { addEvent } = useEventLogStore();

  const detect = useCallback(async () => {
    addEvent('platform_detect_start');
    try {
      if (!isTossApp()) {
        const ua = navigator.userAgent.toLowerCase();
        const os: PlatformOS = /iphone|ipad|ipod/.test(ua) ? 'ios' : /android/.test(ua) ? 'android' : 'unknown';
        const info: PlatformInfo = { os, isIOS: os === 'ios', isAndroid: os === 'android', version: navigator.userAgent };
        setPlatform(info);
        addEvent('platform_detected_web', { os });
        return;
      }
      const { getPlatformOS } = await import('@apps-in-toss/web-framework') as unknown as {
        getPlatformOS: { (): PlatformOS; isSupported: () => boolean };
      };
      if (!getPlatformOS.isSupported()) throw new Error('Not supported');
      const os = getPlatformOS();
      setPlatform({ os, isIOS: os === 'ios', isAndroid: os === 'android', version: '' });
      addEvent('platform_detected', { os });
    } catch (error) {
      addEvent('platform_error', { error: String(error) });
      setPlatform({ os: 'unknown', isIOS: false, isAndroid: false, version: '' });
    }
  }, [addEvent]);

  useEffect(() => { detect(); }, [detect]);

  return { platform, refresh: detect };
}
