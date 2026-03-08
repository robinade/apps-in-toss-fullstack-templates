import { useCallback, useRef, useEffect } from 'react';
import { contactsViral } from '@apps-in-toss/web-framework';
import { isTossApp, getEnvironment } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';
import { create } from 'zustand';

const SHARE_CONFIG = {
  MODULE_ID: import.meta.env.VITE_SHARE_MODULE_ID || '<YOUR_MODULE_ID>',
  MAX_DAILY_SHARES: 10,
} as const;

interface ShareStore {
  todayShareCount: number;
  totalRewards: number;
  recordShare: (success: boolean) => void;
  addReward: (amount: number) => void;
}

export const useShareStore = create<ShareStore>((set) => ({
  todayShareCount: 0,
  totalRewards: 0,
  recordShare: (success) =>
    set((s) => ({ todayShareCount: success ? s.todayShareCount + 1 : s.todayShareCount })),
  addReward: (amount) =>
    set((s) => ({ totalRewards: s.totalRewards + amount })),
}));

export function useShareReward() {
  const { todayShareCount, totalRewards, recordShare, addReward } = useShareStore();
  const { addEvent } = useEventLogStore();
  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  const env = getEnvironment();
  const canShare = todayShareCount < SHARE_CONFIG.MAX_DAILY_SHARES;

  const openShareModal = useCallback(() => {
    if (!canShare) {
      addEvent('share_blocked', { reason: 'daily_limit' });
      return;
    }

    if (!isTossApp()) {
      addEvent('mock_share_start');
      setTimeout(() => {
        addReward(1);
        recordShare(true);
        addEvent('mock_share_complete', { reward: 1 });
      }, 2000);
      return;
    }

    cleanupRef.current?.();
    addEvent('share_modal_opening', { env });

    try {
      const cleanup = contactsViral({
        options: { moduleId: SHARE_CONFIG.MODULE_ID.trim() },
        onEvent: (event) => {
          addEvent(`share_${event.type}`, event.data);
          if (event.type === 'sendViral') {
            const amount = event.data.rewardAmount ?? 1;
            addReward(amount);
            recordShare(true);
          }
          if (event.type === 'close') {
            if (event.data.sentRewardsCount === 0) recordShare(false);
          }
        },
        onError: (error) => {
          addEvent('share_error', { error: String(error) });
          recordShare(false);
        },
      });
      cleanupRef.current = cleanup;
    } catch {
      addEvent('share_api_not_available');
      setTimeout(() => {
        addReward(1);
        recordShare(true);
        addEvent('mock_share_fallback_complete');
      }, 2000);
    }
  }, [canShare, env, addEvent, addReward, recordShare]);

  useEffect(() => () => cleanupRef.current?.(), []);

  return {
    todayShareCount,
    totalRewards,
    remainingShares: SHARE_CONFIG.MAX_DAILY_SHARES - todayShareCount,
    canShare,
    openShareModal,
  };
}
