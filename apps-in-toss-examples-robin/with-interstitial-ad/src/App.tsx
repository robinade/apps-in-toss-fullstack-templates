import { DemoLayout } from './components/DemoLayout';
import { useInterstitialAd } from './hooks/useInterstitialAd';
import { useEventLogStore } from './stores/eventLogStore';
import { useState } from 'react';

export default function App() {
  const { loading, isReady, retryCount, adViewCount, loadAd, showAd } = useInterstitialAd();
  const { events } = useEventLogStore();
  const [currentScreen, setCurrentScreen] = useState(1);

  const handleNavigate = () => {
    showAd({
      onCompleted: () => {
        setCurrentScreen(s => s + 1);
      },
      onError: (error) => {
        console.error('전면 광고 오류:', error);
        setCurrentScreen(s => s + 1);
      },
    });
  };

  return (
    <DemoLayout
      title="전면 광고"
      description="화면 전환 전 전면 광고를 노출하는 예제"
      statusItems={[
        { label: '상태', value: loading ? '로딩 중' : isReady ? '준비됨' : '대기', variant: isReady ? 'success' : 'default' },
        { label: '리트라이', value: `${retryCount}회` },
        { label: '시청 횟수', value: `${adViewCount}회` },
        { label: '현재 화면', value: `${currentScreen}` },
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        <div className="p-4 bg-indigo-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-indigo-600">화면 {currentScreen}</p>
          <p className="text-xs text-gray-500 mt-1">다음 화면으로 이동하면 전면 광고가 표시됩니다</p>
        </div>

        <button
          onClick={handleNavigate}
          disabled={loading || !isReady}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '광고 로딩 중...' : isReady ? '다음 화면으로' : '준비 중...'}
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
