import { DemoLayout } from './components/DemoLayout';
import { ShareCard } from './components/ShareCard';
import { useShareReward } from './hooks/useShareReward';
import { getEnvironment } from './lib/environment';
import { useAppStore } from './stores/appStore';

export default function App() {
  const env = getEnvironment();
  const events = useAppStore((s) => s.events);
  const share = useShareReward();

  return (
    <DemoLayout
      title="공유 바이럴 리워드"
      description="contactsViral API로 친구에게 공유하고 리워드를 받는 시나리오"
      statusItems={[
        { label: '환경', value: env, variant: env === 'toss' ? 'success' : 'default' },
        { label: '오늘 공유', value: `${share.todayShareCount}/10` },
        { label: '총 리워드', value: `${share.totalRewards}개` },
      ]}
      eventLog={events}
    >
      <ShareCard
        todayShareCount={share.todayShareCount}
        remainingShares={share.remainingShares}
        totalRewards={share.totalRewards}
        canShare={share.canShare}
        isSharing={share.isSharing}
        onShare={share.openShareModal}
      />
    </DemoLayout>
  );
}
