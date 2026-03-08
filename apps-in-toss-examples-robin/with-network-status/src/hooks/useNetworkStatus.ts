import { useState, useEffect, useCallback } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

interface NetworkInfo {
  isOnline: boolean;
  type: string;
  lastChecked: number;
}

export function useNetworkStatus() {
  const [network, setNetwork] = useState<NetworkInfo>({
    isOnline: navigator.onLine,
    type: 'unknown',
    lastChecked: Date.now(),
  });
  const { addEvent } = useEventLogStore();

  const checkStatus = useCallback(async () => {
    addEvent('network_check');
    try {
      if (!isTossApp()) {
        setNetwork({
          isOnline: navigator.onLine,
          type: navigator.onLine ? 'web' : 'offline',
          lastChecked: Date.now(),
        });
        addEvent('network_status', { online: navigator.onLine });
        return;
      }

      const { getNetworkStatus } = await import('@apps-in-toss/web-framework') as unknown as {
        getNetworkStatus: {
          (): Promise<{ isConnected: boolean; type: string }>;
          isSupported: () => boolean;
        };
      };

      if (!getNetworkStatus.isSupported()) {
        throw new Error('Not supported');
      }

      const status = await getNetworkStatus();
      setNetwork({
        isOnline: status.isConnected,
        type: status.type,
        lastChecked: Date.now(),
      });
      addEvent('network_status', {
        online: status.isConnected,
        type: status.type,
      });
    } catch (error) {
      addEvent('network_error', { error: String(error) });
    }
  }, [addEvent]);

  useEffect(() => {
    checkStatus();

    const handleOnline = () => {
      setNetwork((s) => ({ ...s, isOnline: true, lastChecked: Date.now() }));
      addEvent('network_online');
    };
    const handleOffline = () => {
      setNetwork((s) => ({ ...s, isOnline: false, lastChecked: Date.now() }));
      addEvent('network_offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkStatus, addEvent]);

  return { network, refresh: checkStatus };
}
