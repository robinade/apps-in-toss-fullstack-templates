import { useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';
import { useAppStore } from '../stores/appStore';

interface Mission {
  key: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement';
  targetCount: number;
  currentCount: number;
  rewardAmount: number;
  completed: boolean;
  claimed: boolean;
}

interface MissionsResponse {
  success: boolean;
  data: { missions: Mission[]; totalEarned: number };
}

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const addEvent = useAppStore((s) => s.addEvent);

  const refreshMissions = useCallback(async () => {
    try {
      const res = await api.get<MissionsResponse>('/api/missions/list');
      if (res.success) {
        setMissions(res.data.missions);
        setTotalEarned(res.data.totalEarned);
      }
    } catch (error) {
      console.error('[Missions] 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const progressMission = useCallback(async (key: string, count = 1) => {
    try {
      await api.post('/api/missions/progress', { key, count });
      addEvent('mission_progress', { key, count });
      await refreshMissions();
    } catch (error) {
      console.error('[Missions] 진행 실패:', error);
    }
  }, [addEvent, refreshMissions]);

  const claimReward = useCallback(async (key: string): Promise<{ rewardAmount: number }> => {
    try {
      const res = await api.post<{ success: boolean; data: { rewardAmount: number } }>(
        '/api/missions/claim',
        { key }
      );
      addEvent('mission_claimed', { key, reward: res.data.rewardAmount });
      await refreshMissions();
      return { rewardAmount: res.data.rewardAmount };
    } catch (error) {
      console.error('[Missions] 보상 수령 실패:', error);
      return { rewardAmount: 0 };
    }
  }, [addEvent, refreshMissions]);

  const claimableCount = missions.filter((m) => m.completed && !m.claimed).length;

  useEffect(() => {
    refreshMissions();
  }, [refreshMissions]);

  return {
    missions,
    isLoading,
    claimableCount,
    totalEarned,
    progressMission,
    claimReward,
    refreshMissions,
  };
}
