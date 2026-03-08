import { useState } from 'react';
import { DemoLayout } from './components/DemoLayout';
import { LotteryCard } from './components/LotteryCard';
import { ResultModal } from './components/ResultModal';
import { RewardAnimation } from './components/RewardAnimation';
import { useLottery } from './hooks/useLottery';
import { useRewardedAd } from './hooks/useRewardedAd';
import { getEnvironment } from './lib/environment';
import { useAppStore } from './stores/appStore';

export default function App() {
  const env = getEnvironment();
  const events = useAppStore((s) => s.events);
  const lottery = useLottery();
  const ad = useRewardedAd();

  const [showResult, setShowResult] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleDraw = async () => {
    const result = await lottery.draw();
    setShowResult(true);
    if (result.prizeAmount > 0) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
    }
  };

  const handleWatchAd = async () => {
    ad.onRewarded = async () => {
      await lottery.watchAdForChance();
    };
    await ad.showAd();
  };

  return (
    <>
      <DemoLayout
        title="복권 뽑기 + 리워드"
        description="광고를 시청하여 기회를 얻고, 복권을 뽑아 포인트를 획득하는 시나리오"
        statusItems={[
          { label: '환경', value: env, variant: env === 'toss' ? 'success' : 'default' },
          { label: '남은 기회', value: `${lottery.chances}개` },
          { label: '광고', value: ad.isReady ? '준비됨' : '로딩...', variant: ad.isReady ? 'success' : 'default' },
        ]}
        eventLog={events}
      >
        <div className="space-y-4">
          <LotteryCard
            chances={lottery.chances}
            isDrawing={lottery.isDrawing}
            onDraw={handleDraw}
            onWatchAd={handleWatchAd}
            adReady={ad.isReady}
            adLoading={ad.isLoading}
          />

          {lottery.recentResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">최근 결과</h3>
              {lottery.recentResults.map((r, i) => (
                <div key={i} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg p-2">
                  <span className="font-medium">{r.tier}</span>
                  <span className="text-gray-500">{r.prizeName}</span>
                  <span className="font-bold text-amber-600">{r.prizeAmount}P</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DemoLayout>

      <ResultModal
        isOpen={showResult}
        tier={lottery.lastResult?.tier ?? ''}
        prizeName={lottery.lastResult?.prizeName ?? ''}
        prizeAmount={lottery.lastResult?.prizeAmount ?? 0}
        onClose={() => setShowResult(false)}
      />

      <RewardAnimation isVisible={showAnimation} amount={lottery.lastResult?.prizeAmount ?? 0} />
    </>
  );
}
