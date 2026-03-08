import { cn } from '../lib/utils';

interface Milestone {
  key: string;
  label: string;
  requiredDays: number;
  rewardAmount: number;
  isReached: boolean;
  isClaimed: boolean;
}

interface MilestoneProgressProps {
  milestones: Milestone[];
  currentDays: number;
  onClaim: (key: string) => void;
}

export function MilestoneProgress({ milestones, currentDays, onClaim }: MilestoneProgressProps) {
  const maxDays = milestones[milestones.length - 1]?.requiredDays ?? 28;
  const progressPercent = Math.min((currentDays / maxDays) * 100, 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">마일스톤 진행</h3>
        <span className="text-sm text-indigo-600 font-medium">{currentDays}일째</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Milestone list */}
      <div className="space-y-2">
        {milestones.map((m) => (
          <div
            key={m.key}
            className={cn(
              'flex items-center justify-between p-3 rounded-xl',
              m.isClaimed ? 'bg-gray-50' : m.isReached ? 'bg-green-50' : 'bg-white border border-gray-100'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                m.isClaimed ? 'bg-gray-200 text-gray-400' : m.isReached ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
              )}>
                {m.requiredDays}
              </div>
              <div>
                <p className={cn('text-sm font-medium', m.isClaimed && 'text-gray-400')}>{m.label}</p>
                <p className="text-xs text-gray-400">{m.rewardAmount}P</p>
              </div>
            </div>

            {m.isClaimed ? (
              <span className="text-xs text-gray-400">수령 완료</span>
            ) : m.isReached ? (
              <button
                onClick={() => onClaim(m.key)}
                className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full hover:bg-green-200"
              >
                수령
              </button>
            ) : (
              <span className="text-xs text-gray-400">{m.requiredDays - currentDays}일 남음</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
