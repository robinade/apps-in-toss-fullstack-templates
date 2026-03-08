import { useState } from 'react';
import { DemoLayout } from './components/DemoLayout';
import { MissionCard } from './components/MissionCard';
import { ClaimModal } from './components/ClaimModal';
import { useMissions } from './hooks/useMissions';
import { getEnvironment } from './lib/environment';
import { useAppStore } from './stores/appStore';

export default function App() {
  const env = getEnvironment();
  const events = useAppStore((s) => s.events);
  const { missions, isLoading, claimableCount, totalEarned, progressMission, claimReward } = useMissions();

  const [claimResult, setClaimResult] = useState<{ amount: number; title: string } | null>(null);

  const handleClaim = async (key: string, title: string) => {
    const result = await claimReward(key);
    if (result.rewardAmount > 0) {
      setClaimResult({ amount: result.rewardAmount, title });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <DemoLayout
        title="미션 시스템"
        description="미션 수행 + 진행도 관리 + 보상 수령 시나리오"
        statusItems={[
          { label: '환경', value: env, variant: env === 'toss' ? 'success' : 'default' },
          { label: '수령 가능', value: `${claimableCount}개`, variant: claimableCount > 0 ? 'success' : 'default' },
          { label: '총 획득', value: `${totalEarned}P` },
        ]}
        eventLog={events}
      >
        <div className="space-y-3">
          {missions.map((mission) => (
            <MissionCard
              key={mission.key}
              title={mission.title}
              description={mission.description}
              type={mission.type}
              currentCount={mission.currentCount}
              targetCount={mission.targetCount}
              rewardAmount={mission.rewardAmount}
              completed={mission.completed}
              claimed={mission.claimed}
              onProgress={() => progressMission(mission.key)}
              onClaim={() => handleClaim(mission.key, mission.title)}
            />
          ))}
        </div>
      </DemoLayout>

      <ClaimModal
        isOpen={claimResult !== null}
        rewardAmount={claimResult?.amount ?? 0}
        missionTitle={claimResult?.title ?? ''}
        onClose={() => setClaimResult(null)}
      />
    </>
  );
}
