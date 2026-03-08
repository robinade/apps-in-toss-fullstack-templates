import { useCallback, useEffect, useRef, useState } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

export function useBackEvent() {
  const [intercepting, setIntercepting] = useState(false);
  const [backCount, setBackCount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  const { addEvent } = useEventLogStore();

  const startIntercepting = useCallback(async () => {
    addEvent('back_intercept_start');
    if (!isTossApp()) {
      const handler = (e: PopStateEvent) => {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        setBackCount(c => c + 1);
        setShowConfirm(true);
        addEvent('back_intercepted_web');
      };
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handler);
      cleanupRef.current = () => window.removeEventListener('popstate', handler);
      setIntercepting(true);
      return;
    }
    try {
      const { useBackEvent: sdkBackEvent } = await import('@apps-in-toss/web-framework') as unknown as {
        useBackEvent: {
          (callback: () => void): () => void;
          isSupported: () => boolean;
        };
      };
      if (!sdkBackEvent.isSupported()) throw new Error('Not supported');
      const cleanup = sdkBackEvent(() => {
        setBackCount(c => c + 1);
        setShowConfirm(true);
        addEvent('back_intercepted');
      });
      cleanupRef.current = cleanup;
      setIntercepting(true);
    } catch (error) {
      addEvent('back_error', { error: String(error) });
    }
  }, [addEvent]);

  const stopIntercepting = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = undefined;
    setIntercepting(false);
    addEvent('back_intercept_stop');
  }, [addEvent]);

  const confirmExit = useCallback(() => {
    setShowConfirm(false);
    stopIntercepting();
    addEvent('back_confirmed_exit');
  }, [stopIntercepting, addEvent]);

  const cancelExit = useCallback(() => {
    setShowConfirm(false);
    addEvent('back_cancelled_exit');
  }, [addEvent]);

  useEffect(() => () => cleanupRef.current?.(), []);

  return { intercepting, backCount, showConfirm, startIntercepting, stopIntercepting, confirmExit, cancelExit };
}
