import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useAppStore } from '../stores/appStore';

interface CoachMarkDef {
  targetSelector: string;
  message: string;
}

const COACH_MARKS: CoachMarkDef[] = [
  { targetSelector: '[data-coach="welcome"]', message: '여기에서 주요 기능을 확인할 수 있어요' },
  { targetSelector: '[data-coach="action"]', message: '이 버튼으로 액션을 실행해보세요' },
  { targetSelector: '[data-coach="status"]', message: '현재 상태를 여기서 확인할 수 있어요' },
  { targetSelector: '[data-coach="log"]', message: '이벤트 로그로 SDK 동작을 확인하세요' },
];

export function useCoachMarks() {
  const [isActive, setIsActive] = useState(false);
  const [currentMark, setCurrentMark] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const addEvent = useAppStore((s) => s.addEvent);

  const updateTargetRect = useCallback(() => {
    const mark = COACH_MARKS[currentMark];
    if (!mark) return;
    const el = document.querySelector(mark.targetSelector);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    }
  }, [currentMark]);

  useEffect(() => {
    if (!isActive) return;
    updateTargetRect();
    intervalRef.current = setInterval(updateTargetRect, 500);
    return () => clearInterval(intervalRef.current);
  }, [isActive, updateTargetRect]);

  const start = useCallback(() => {
    setIsActive(true);
    setCurrentMark(0);
    addEvent('coach_marks_started', {});
  }, [addEvent]);

  const nextMark = useCallback(() => {
    if (currentMark < COACH_MARKS.length - 1) {
      setCurrentMark((prev) => prev + 1);
      addEvent('coach_mark_next', { mark: currentMark + 1 });
    }
  }, [currentMark, addEvent]);

  const skipAll = useCallback(() => {
    setIsActive(false);
    addEvent('coach_marks_skipped', {});
  }, [addEvent]);

  const complete = useCallback(async () => {
    setIsActive(false);
    try {
      await api.post('/api/onboarding/coach-marks-seen', {});
      addEvent('coach_marks_completed', {});
    } catch (error) {
      console.error('[CoachMarks] 완료 처리 실패:', error);
    }
  }, [addEvent]);

  return {
    isActive,
    currentMark,
    totalMarks: COACH_MARKS.length,
    targetRect,
    message: COACH_MARKS[currentMark]?.message ?? '',
    start,
    nextMark,
    skipAll,
    complete,
  };
}
