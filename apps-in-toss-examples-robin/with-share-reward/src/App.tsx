import { DemoLayout } from './components/DemoLayout';
import { useShareReward } from './hooks/useShareReward';
import { useEventLogStore } from './stores/eventLogStore';

export default function App() {
  const { todayShareCount, totalRewards, remainingShares, canShare, openShareModal } = useShareReward();
  const { events } = useEventLogStore();

  return (
    <DemoLayout
      title="공유 리워드"
      description="연락처 공유로 리워드를 받는 예제"
      statusItems={[
        { label: '오늘 공유', value: `${todayShareCount}회` },
        { label: '남은 공유', value: `${remainingShares}회`, variant: remainingShares < 3 ? 'error' : 'default' },
        { label: '총 리워드', value: `${totalRewards}`, variant: 'success' },
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        <div className="p-4 bg-indigo-50 rounded-lg text-center">
          <p className="text-3xl font-bold text-indigo-600">{totalRewards}</p>
          <p className="text-xs text-gray-500 mt-1">획득한 리워드</p>
        </div>

        <button
          onClick={openShareModal}
          disabled={!canShare}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canShare ? '친구에게 공유하기' : '오늘 공유 한도 초과'}
        </button>

        <p className="text-xs text-center text-gray-400">
          하루 최대 {10}회 공유 가능
        </p>
      </div>
    </DemoLayout>
  );
}
