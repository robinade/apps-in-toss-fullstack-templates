import { useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';
import { useAppStore } from '../stores/appStore';

interface AttendanceStatus {
  checked: boolean;
  streak: number;
  todayReward: number;
  monthlyDays: number;
  history: string[];
}

export function useAttendance() {
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const addEvent = useAppStore((s) => s.addEvent);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: AttendanceStatus }>('/api/attendance/status');
      if (res.success) setStatus(res.data);
    } catch (error) {
      console.error('[Attendance] 상태 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: { dates: string[] } }>('/api/attendance/history');
      if (res.success) setHistory(res.data.dates);
    } catch (error) {
      console.error('[Attendance] 이력 조회 실패:', error);
    }
  }, []);

  const checkIn = useCallback(async (): Promise<{ reward: number; streakBonus: number }> => {
    setIsCheckingIn(true);
    try {
      const res = await api.post<{
        success: boolean;
        data: { reward: number; streakBonus: number; streak: number };
      }>('/api/attendance/check-in', {});

      if (res.success) {
        addEvent('attendance_checked', { reward: res.data.reward, streakBonus: res.data.streakBonus });
        await fetchStatus();
        await fetchHistory();
        return { reward: res.data.reward, streakBonus: res.data.streakBonus };
      }
      return { reward: 0, streakBonus: 0 };
    } catch (error) {
      console.error('[Attendance] 출석 체크 실패:', error);
      return { reward: 0, streakBonus: 0 };
    } finally {
      setIsCheckingIn(false);
    }
  }, [addEvent, fetchStatus, fetchHistory]);

  useEffect(() => {
    fetchStatus();
    fetchHistory();
  }, [fetchStatus, fetchHistory]);

  return { status, isLoading, isCheckingIn, history, checkIn, fetchStatus, fetchHistory };
}
