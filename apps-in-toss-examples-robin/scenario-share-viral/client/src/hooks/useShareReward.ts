import { useCallback, useRef, useEffect, useState } from 'react';
import { getEnvironment } from '../lib/environment';
import { api } from '../lib/api';
import { useAppStore } from '../stores/appStore';

const MODULE_ID = import.meta.env.VITE_SHARE_MODULE_ID || 'test-module-id';
const MAX_DAILY_SHARES = 10;

interface ShareStatus {
  todayShareCount: number;
  remainingShares: number;
  totalRewards: number;
  canShare: boolean;
}

export function useShareReward() {
  const [status, setStatus] = useState<ShareStatus>({
    todayShareCount: 0,
    remainingShares: MAX_DAILY_SHARES,
    totalRewards: 0,
    canShare: true,
  });
  const [isSharing, setIsSharing] = useState(false);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  const addEvent = useAppStore((s) => s.addEvent);

  const env = getEnvironment();
  const isTossApp = env !== 'web';

  // 서버에서 현황 조회
  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: ShareStatus }>('/api/share/status');
      if (res.success) setStatus(res.data);
    } catch (error) {
      console.error('[Share] 현황 조회 실패:', error);
    }
  }, []);

  // 서버에 공유 기록
  const recordShare = useCallback(async (success: boolean, rewardAmount = 1) => {
    try {
      await api.post('/api/share/record', { success, rewardAmount });
      await fetchStatus(); // 현황 갱신
    } catch (error) {
      console.error('[Share] 기록 실패:', error);
    }
  }, [fetchStatus]);

  // Mock 공유 (웹 환경)
  const runMockShare = useCallback(async () => {
    setIsSharing(true);
    addEvent('share_started', { environment: 'mock' });

    await new Promise((r) => setTimeout(r, 1500));

    addEvent('share_completed', { rewardAmount: 1, rewardUnit: '기회' });
    await recordShare(true, 1);
    setIsSharing(false);
  }, [addEvent, recordShare]);

  // 공유 모달 열기
  const openShareModal = useCallback(async () => {
    if (!status.canShare) {
      addEvent('share_blocked', { reason: 'daily_limit' });
      return;
    }

    if (!isTossApp) {
      runMockShare();
      return;
    }

    setIsSharing(true);
    cleanupRef.current?.();

    try {
      // Dynamic import — SDK Safety Pattern
      const { contactsViral } = await import('@apps-in-toss/web-framework');

      const cleanup = contactsViral({
        options: { moduleId: MODULE_ID.trim() },
        onEvent: (event: { type: string; data: Record<string, unknown> }) => {
          addEvent(`contactsViral_${event.type}`, event.data);

          if (event.type === 'sendViral') {
            const rewardAmount = (event.data.rewardAmount as number) ?? 1;
            recordShare(true, rewardAmount);
          }

          if (event.type === 'close') {
            if ((event.data.sentRewardsCount as number) === 0) {
              recordShare(false);
            }
            setIsSharing(false);
          }
        },
        onError: (error: unknown) => {
          addEvent('contactsViral_error', { error: String(error) });
          recordShare(false);
          setIsSharing(false);
        },
      });

      cleanupRef.current = cleanup;
    } catch {
      runMockShare();
    }
  }, [status.canShare, isTossApp, addEvent, recordShare, runMockShare]);

  useEffect(() => {
    fetchStatus();
    return () => cleanupRef.current?.();
  }, [fetchStatus]);

  return { ...status, isSharing, openShareModal, refreshStatus: fetchStatus };
}
