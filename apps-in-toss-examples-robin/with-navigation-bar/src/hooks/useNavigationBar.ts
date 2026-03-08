import { useCallback, useEffect, useRef, useState } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

interface AccessoryButton {
  id: string;
  title: string;
  icon: { name: string };
}

interface NavBarState {
  accessoryButton: AccessoryButton | null;
  lastClickedId: string | null;
}

export function useNavigationBar() {
  const [state, setState] = useState<NavBarState>({ accessoryButton: null, lastClickedId: null });
  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  const { addEvent } = useEventLogStore();

  const addAccessoryButton = useCallback(async (button: AccessoryButton) => {
    addEvent('navbar_add_accessory', { id: button.id, title: button.title });
    try {
      if (!isTossApp()) {
        // Web fallback: just track state
        setState(s => ({ ...s, accessoryButton: button }));
        addEvent('navbar_accessory_added_web', { id: button.id });
        return;
      }
      const { partner, tdsEvent } = await import('@apps-in-toss/web-framework') as unknown as {
        partner: {
          addAccessoryButton: (opts: AccessoryButton) => void;
        };
        tdsEvent: {
          addEventListener: (event: string, handler: { onEvent: (data: { id: string }) => void }) => () => void;
        };
      };

      partner.addAccessoryButton(button);

      // Listen for click events
      const cleanup = tdsEvent.addEventListener('navigationAccessoryEvent', {
        onEvent: ({ id }) => {
          if (id === button.id) {
            setState(s => ({ ...s, lastClickedId: id }));
            addEvent('navbar_accessory_clicked', { id });
          }
        },
      });
      cleanupRef.current = cleanup;
      setState(s => ({ ...s, accessoryButton: button }));
      addEvent('navbar_accessory_added', { id: button.id });
    } catch (error) {
      addEvent('navbar_error', { op: 'addAccessoryButton', error: String(error) });
    }
  }, [addEvent]);

  const simulateClick = useCallback((id: string) => {
    setState(s => ({ ...s, lastClickedId: id }));
    addEvent('navbar_accessory_clicked_web', { id });
  }, [addEvent]);

  useEffect(() => () => cleanupRef.current?.(), []);

  return { ...state, addAccessoryButton, simulateClick };
}
