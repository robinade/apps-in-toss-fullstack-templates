import { useCallback, useRef, useEffect } from 'react';
import { contactsViral } from '@apps-in-toss/web-framework';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';
import { create } from 'zustand';

const MODULE_ID = import.meta.env.VITE_VIRAL_MODULE_ID || '<YOUR_MODULE_ID>';

interface ViralStore {
  sentCount: number;
  acceptedCount: number;
  rewardTotal: number;
  addSent: (count: number) => void;
  addAccepted: () => void;
  addReward: (amount: number) => void;
}

export const useViralStore = create<ViralStore>((set) => ({
  sentCount: 0,
  acceptedCount: 0,
  rewardTotal: 0,
  addSent: (count) => set(s => ({ sentCount: s.sentCount + count })),
  addAccepted: () => set(s => ({ acceptedCount: s.acceptedCount + 1 })),
  addReward: (amount) => set(s => ({ rewardTotal: s.rewardTotal + amount })),
}));

export function useContactsViral() {
  const { sentCount, acceptedCount, rewardTotal, addSent, addReward } = useViralStore();
  const { addEvent } = useEventLogStore();
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  const openInvite = useCallback(() => {
    if (!isTossApp()) {
      addEvent('mock_invite_start');
      setTimeout(() => {
        addSent(3);
        addReward(1);
        addEvent('mock_invite_complete', { sent: 3, reward: 1 });
      }, 2000);
      return;
    }

    cleanupRef.current?.();
    addEvent('invite_modal_opening');

    try {
      const cleanup = contactsViral({
        options: { moduleId: MODULE_ID.trim() },
        onEvent: (event) => {
          addEvent(`invite_${event.type}`, event.data);
          if (event.type === 'sendViral') {
            const amount = event.data.rewardAmount ?? 1;
            addSent(1);
            addReward(amount);
          }
          if (event.type === 'close') {
            addEvent('invite_modal_closed', { sentRewards: event.data.sentRewardsCount });
          }
        },
        onError: (error) => {
          addEvent('invite_error', { error: String(error) });
        },
      });
      cleanupRef.current = cleanup;
    } catch {
      addEvent('invite_api_not_available');
      setTimeout(() => {
        addSent(2);
        addReward(1);
        addEvent('mock_invite_fallback');
      }, 2000);
    }
  }, [addEvent, addSent, addReward]);

  useEffect(() => () => cleanupRef.current?.(), []);

  return { sentCount, acceptedCount, rewardTotal, openInvite };
}
