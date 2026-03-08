import { useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';
import { useAppStore } from '../stores/appStore';

const TOTAL_STEPS = 3;

interface OnboardingStatusResponse {
  success: boolean;
  data: { completed: boolean; coachMarksSeen: boolean };
}

export function useOnboarding() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const addEvent = useAppStore((s) => s.addEvent);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get<OnboardingStatusResponse>('/api/onboarding/status');
      if (res.success) {
        setIsCompleted(res.data.completed);
      }
    } catch (error) {
      console.error('[Onboarding] 상태 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
    addEvent('onboarding_next_step', { step: currentStep + 1 });
  }, [addEvent, currentStep]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    addEvent('onboarding_prev_step', { step: currentStep - 1 });
  }, [addEvent, currentStep]);

  const completeOnboarding = useCallback(async () => {
    try {
      await api.post('/api/onboarding/complete', {});
      setIsCompleted(true);
      addEvent('onboarding_completed', {});
    } catch (error) {
      console.error('[Onboarding] 완료 처리 실패:', error);
    }
  }, [addEvent]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    isCompleted,
    isLoading,
    currentStep,
    totalSteps: TOTAL_STEPS,
    nextStep,
    prevStep,
    completeOnboarding,
  };
}
