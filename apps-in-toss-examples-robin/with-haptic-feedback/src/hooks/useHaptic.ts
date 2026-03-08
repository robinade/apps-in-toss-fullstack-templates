import { useCallback } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

type HapticType = 'light' | 'medium' | 'heavy' | 'selection';

export function useHaptic() {
  const { addEvent } = useEventLogStore();

  const trigger = useCallback(async (type: HapticType) => {
    addEvent('haptic_trigger', { type });
    try {
      if (!isTossApp()) {
        // Web fallback: vibrate API
        if ('vibrate' in navigator) {
          const durations: Record<HapticType, number> = {
            light: 10,
            medium: 30,
            heavy: 50,
            selection: 5,
          };
          navigator.vibrate(durations[type]);
        }
        addEvent('haptic_mock', { type });
        return;
      }

      const { generateHapticFeedback } = await import('@apps-in-toss/web-framework') as unknown as {
        generateHapticFeedback: { (opts: { type: HapticType }): void; isSupported: () => boolean };
      };
      if (!generateHapticFeedback.isSupported()) {
        addEvent('haptic_not_supported');
        return;
      }
      generateHapticFeedback({ type });
      addEvent('haptic_success', { type });
    } catch (error) {
      addEvent('haptic_error', { error: String(error) });
    }
  }, [addEvent]);

  return { trigger };
}
