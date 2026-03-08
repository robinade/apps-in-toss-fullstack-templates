import { useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';
import { useAppStore } from '../stores/appStore';

interface LotteryResult {
  tier: string;
  prizeName: string;
  prizeAmount: number;
}

interface LotteryStatus {
  chances: number;
  recentResults: LotteryResult[];
}

export function useLottery() {
  const [chances, setChances] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastResult, setLastResult] = useState<LotteryResult | null>(null);
  const [recentResults, setRecentResults] = useState<LotteryResult[]>([]);
  const addEvent = useAppStore((s) => s.addEvent);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: LotteryStatus }>('/api/lottery/status');
      if (res.success) {
        setChances(res.data.chances);
        setRecentResults(res.data.recentResults);
      }
    } catch (error) {
      console.error('[Lottery] 상태 조회 실패:', error);
    }
  }, []);

  const watchAdForChance = useCallback(async () => {
    try {
      const res = await api.post<{ success: boolean; data: { chances: number } }>(
        '/api/lottery/watch-ad',
        {}
      );
      if (res.success) {
        setChances(res.data.chances);
        addEvent('ad_watched_for_chance', { newChances: res.data.chances });
      }
    } catch (error) {
      console.error('[Lottery] 광고 시청 기록 실패:', error);
    }
  }, [addEvent]);

  const draw = useCallback(async (): Promise<LotteryResult> => {
    setIsDrawing(true);
    try {
      const res = await api.post<{ success: boolean; data: LotteryResult }>(
        '/api/lottery/draw',
        {}
      );
      if (res.success) {
        setLastResult(res.data);
        addEvent('lottery_draw', res.data);
        await refreshStatus();
        return res.data;
      }
      return { tier: '꽝', prizeName: '다음에', prizeAmount: 0 };
    } catch (error) {
      console.error('[Lottery] 뽑기 실패:', error);
      return { tier: '꽝', prizeName: '다음에', prizeAmount: 0 };
    } finally {
      setIsDrawing(false);
    }
  }, [addEvent, refreshStatus]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return { chances, isDrawing, lastResult, recentResults, watchAdForChance, draw, refreshStatus };
}
