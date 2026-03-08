import { useState } from 'react';
import { DemoLayout } from './components/DemoLayout';
import { AttendanceCalendar } from './components/AttendanceCalendar';
import { AdModal } from './components/AdModal';
import { RewardToast } from './components/RewardToast';
import { useAttendance } from './hooks/useAttendance';
import { useRewardedAd } from './hooks/useRewardedAd';
import { getEnvironment } from './lib/environment';
import { useAppStore } from './stores/appStore';

export default function App() {
  const env = getEnvironment();
  const events = useAppStore((s) => s.events);
  const attendance = useAttendance();
  const ad = useRewardedAd();

  const [showAdModal, setShowAdModal] = useState(false);
  const [rewardToast, setRewardToast] = useState<{ reward: number; streakBonus: number } | null>(null);

  const handleCheckIn = () => {
    if (attendance.status?.checked) return;
    setShowAdModal(true);
  };

  const handleWatchAd = async () => {
    ad.onRewarded = async () => {
      const result = await attendance.checkIn();
      setShowAdModal(false);
      if (result.reward > 0) {
        setRewardToast(result);
      }
    };
    await ad.showAd();
  };

  if (attendance.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <DemoLayout
        title="출석 체크 + 보상형 광고"
        description="매일 광고를 시청하고 출석 체크하면 보상을 받는 시나리오"
        statusItems={[
          { label: '환경', value: env, variant: env === 'toss' ? 'success' : 'default' },
          { label: '오늘 출석', value: attendance.status?.checked ? '완료' : '미완료', variant: attendance.status?.checked ? 'success' : 'default' },
          { label: '연속', value: `${attendance.status?.streak ?? 0}일` },
          { label: '이번 달', value: `${attendance.status?.monthlyDays ?? 0}일` },
        ]}
        eventLog={events}
      >
        <div className="space-y-4">
          <AttendanceCalendar
            history={attendance.history}
            streak={attendance.status?.streak ?? 0}
          />

          <button
            onClick={handleCheckIn}
            disabled={attendance.status?.checked || attendance.isCheckingIn}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
              attendance.status?.checked
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {attendance.status?.checked ? '오늘 출석 완료!' : attendance.isCheckingIn ? '처리 중...' : '출석 체크하기'}
          </button>
        </div>
      </DemoLayout>

      <AdModal
        isOpen={showAdModal}
        isLoading={ad.isLoading}
        isShowing={ad.isShowing}
        onWatch={handleWatchAd}
        onClose={() => setShowAdModal(false)}
      />

      <RewardToast
        isVisible={rewardToast !== null}
        reward={rewardToast?.reward ?? 0}
        streakBonus={rewardToast?.streakBonus ?? 0}
        onClose={() => setRewardToast(null)}
      />
    </>
  );
}
