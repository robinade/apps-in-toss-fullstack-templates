import { DemoLayout } from './components/DemoLayout';
import { CoachMarks } from './components/CoachMarks';
import { OnboardingCards } from './components/OnboardingCards';
import { useOnboarding } from './hooks/useOnboarding';
import { useCoachMarks } from './hooks/useCoachMarks';
import { getEnvironment } from './lib/environment';
import { useAppStore } from './stores/appStore';
import { useEffect } from 'react';

export default function App() {
  const env = getEnvironment();
  const events = useAppStore((s) => s.events);
  const onboarding = useOnboarding();
  const coachMarks = useCoachMarks();

  // 온보딩 완료 후 코치마크 시작
  useEffect(() => {
    if (onboarding.isCompleted && !coachMarks.isActive) {
      // 약간의 딜레이 후 코치마크 시작
      const timer = setTimeout(() => coachMarks.start(), 500);
      return () => clearTimeout(timer);
    }
  }, [onboarding.isCompleted]);

  if (onboarding.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!onboarding.isCompleted) {
    return (
      <OnboardingCards
        currentStep={onboarding.currentStep}
        totalSteps={onboarding.totalSteps}
        onNext={onboarding.nextStep}
        onPrev={onboarding.prevStep}
        onComplete={onboarding.completeOnboarding}
      />
    );
  }

  return (
    <>
      <DemoLayout
        title="온보딩 + 코치마크"
        description="사용자 온보딩 플로우와 코치마크 가이드 시나리오"
        statusItems={[
          { label: '환경', value: env, variant: env === 'toss' ? 'success' : 'default' },
          { label: '온보딩', value: '완료', variant: 'success' },
          { label: '코치마크', value: coachMarks.isActive ? '진행 중' : '완료' },
        ]}
        eventLog={events}
      >
        <div className="space-y-4">
          <div data-coach="welcome" className="bg-indigo-50 rounded-xl p-4">
            <h3 className="font-bold text-indigo-900">환영합니다!</h3>
            <p className="text-sm text-indigo-700 mt-1">온보딩을 완료했어요.</p>
          </div>

          <button
            data-coach="action"
            className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all"
            onClick={() => useAppStore.getState().addEvent('action_clicked', {})}
          >
            액션 실행하기
          </button>

          <div data-coach="status" className="bg-gray-50 rounded-xl p-3">
            <p className="text-sm text-gray-600">상태: 정상</p>
          </div>

          <div data-coach="log" className="text-xs text-gray-400">
            이벤트 로그 영역
          </div>
        </div>
      </DemoLayout>

      <CoachMarks
        isActive={coachMarks.isActive}
        currentMark={coachMarks.currentMark}
        totalMarks={coachMarks.totalMarks}
        targetRect={coachMarks.targetRect}
        message={coachMarks.message}
        onNext={coachMarks.nextMark}
        onSkip={coachMarks.skipAll}
        onComplete={coachMarks.complete}
      />
    </>
  );
}
