import { useState } from 'react';
import { DemoLayout } from './components/DemoLayout';
import { MilestoneProgress } from './components/MilestoneProgress';
import { BalanceCard } from './components/BalanceCard';
import { WithdrawModal } from './components/WithdrawModal';
import { useMilestones } from './hooks/useMilestones';
import { useWithdraw } from './hooks/useWithdraw';
import { getEnvironment } from './lib/environment';
import { useAppStore } from './stores/appStore';

export default function App() {
  const env = getEnvironment();
  const events = useAppStore((s) => s.events);
  const milestones = useMilestones();
  const withdraw = useWithdraw();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleClaim = async (key: string) => {
    await milestones.claimMilestone(key);
    await withdraw.refreshBalance();
  };

  const handleWithdraw = async (amount: number) => {
    const result = await withdraw.withdraw(amount);
    if (result.success) {
      setShowWithdrawModal(false);
    }
  };

  if (milestones.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <DemoLayout
        title="마일스톤 + 포인트 출금"
        description="출석 마일스톤을 달성하고 포인트를 출금하는 시나리오"
        statusItems={[
          { label: '환경', value: env, variant: env === 'toss' ? 'success' : 'default' },
          { label: '누적 일수', value: `${milestones.currentDays}일` },
          { label: '수령 가능', value: `${milestones.claimableCount}개`, variant: milestones.claimableCount > 0 ? 'success' : 'default' },
          { label: '잔고', value: `${withdraw.balance}P` },
        ]}
        eventLog={events}
      >
        <div className="space-y-4">
          <BalanceCard
            balance={withdraw.balance}
            totalWithdrawn={withdraw.totalWithdrawn}
            canWithdraw={withdraw.canWithdraw}
            onWithdraw={() => setShowWithdrawModal(true)}
          />

          <MilestoneProgress
            milestones={milestones.milestones}
            currentDays={milestones.currentDays}
            onClaim={handleClaim}
          />
        </div>
      </DemoLayout>

      <WithdrawModal
        isOpen={showWithdrawModal}
        balance={withdraw.balance}
        isWithdrawing={withdraw.isWithdrawing}
        onWithdraw={handleWithdraw}
        onClose={() => setShowWithdrawModal(false)}
      />
    </>
  );
}
