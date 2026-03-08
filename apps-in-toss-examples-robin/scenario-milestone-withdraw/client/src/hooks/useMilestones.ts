import { useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';
import { useAppStore } from '../stores/appStore';

interface Milestone {
  key: string;
  label: string;
  requiredDays: number;
  rewardAmount: number;
  isReached: boolean;
  isClaimed: boolean;
}

interface MilestonesResponse {
  success: boolean;
  data: { milestones: Milestone[]; currentDays: number };
}

export function useMilestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [currentDays, setCurrentDays] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const addEvent = useAppStore((s) => s.addEvent);

  const refreshMilestones = useCallback(async () => {
    try {
      const res = await api.get<MilestonesResponse>('/api/milestones/status');
      if (res.success) {
        setMilestones(res.data.milestones);
        setCurrentDays(res.data.currentDays);
      }
    } catch (error) {
      console.error('[Milestones] 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const claimMilestone = useCallback(async (key: string): Promise<{ rewardAmount: number }> => {
    try {
      const res = await api.post<{ success: boolean; data: { rewardAmount: number } }>(
        '/api/milestones/claim',
        { key }
      );
      if (res.success) {
        addEvent('milestone_claimed', { key, reward: res.data.rewardAmount });
        await refreshMilestones();
        return { rewardAmount: res.data.rewardAmount };
      }
      return { rewardAmount: 0 };
    } catch (error) {
      console.error('[Milestones] 수령 실패:', error);
      return { rewardAmount: 0 };
    }
  }, [addEvent, refreshMilestones]);

  const claimableCount = milestones.filter((m) => m.isReached && !m.isClaimed).length;

  useEffect(() => {
    refreshMilestones();
  }, [refreshMilestones]);

  return { milestones, currentDays, isLoading, claimableCount, claimMilestone, refreshMilestones };
}
