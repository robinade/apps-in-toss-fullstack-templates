import { DemoLayout } from './components/DemoLayout';
import { useRewardedAd } from './hooks/useRewardedAd';
import { useEventLogStore } from './stores/eventLogStore';
import { useState } from 'react';

export default function App() {
  const { loading, isReady, retryCount, adViewCount, remainingAds, loadAd, showAd } = useRewardedAd();
  const { events } = useEventLogStore();
  const [lastReward, setLastReward] = useState<string | null>(null);

  const handleShowAd = () => {
    showAd({
      onRewarded: (unitType, unitAmount) => {
        setLastReward(`${unitAmount} ${unitType}`);
      },
      onDismiss: () => {},
      onError: (error) => {
        setLastReward(`오류: ${error.message}`);
      },
    });
  };

  return (
    <DemoLayout
      title="보상형 광고"
      description="load → show → reward 패턴의 보상형 광고 예제"
      statusItems={[
        { label: '상태', value: loading ? '로딩 중' : isReady ? '준비됨' : '대기', variant: isReady ? 'success' : 'default' },
        { label: '리트라이', value: `${retryCount}회` },
        { label: '시청 횟수', value: `${adViewCount}회` },
        { label: '남은 횟수', value: `${remainingAds}회`, variant: remainingAds < 10 ? 'error' : 'default' },
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        {lastReward && (
          <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
            마지막 보상: {lastReward}
          </div>
        )}

        <button
          onClick={handleShowAd}
          disabled={loading || !isReady}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '광고 로딩 중...' : isReady ? '광고 보기' : '준비 중...'}
        </button>

        <button
          onClick={loadAd}
          disabled={loading}
          className="w-full py-2 border border-gray-300 rounded-xl text-sm text-gray-700 active:bg-gray-50 transition-colors disabled:opacity-50"
        >
          수동 로드
        </button>
      </div>
    </DemoLayout>
  );
}
