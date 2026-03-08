import { cn } from '../lib/utils';

interface MissionCardProps {
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement';
  currentCount: number;
  targetCount: number;
  rewardAmount: number;
  completed: boolean;
  claimed: boolean;
  onProgress: () => void;
  onClaim: () => void;
}

const TYPE_LABELS = { daily: '일일', weekly: '주간', achievement: '업적' };
const TYPE_COLORS = {
  daily: 'bg-blue-100 text-blue-700',
  weekly: 'bg-purple-100 text-purple-700',
  achievement: 'bg-amber-100 text-amber-700',
};

export function MissionCard({
  title,
  description,
  type,
  currentCount,
  targetCount,
  rewardAmount,
  completed,
  claimed,
  onProgress,
  onClaim,
}: MissionCardProps) {
  const progress = Math.min((currentCount / targetCount) * 100, 100);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', TYPE_COLORS[type])}>
              {TYPE_LABELS[type]}
            </span>
            <h3 className="font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <span className="text-sm font-bold text-amber-600">{rewardAmount}P</span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{currentCount}/{targetCount}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              completed ? 'bg-green-500' : 'bg-indigo-500'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Action button */}
      {claimed ? (
        <div className="text-center text-sm text-gray-400 py-2">수령 완료</div>
      ) : completed ? (
        <button
          onClick={onClaim}
          className="w-full py-2 rounded-lg font-bold text-white bg-green-500 hover:bg-green-600 active:scale-95 transition-all"
        >
          보상 수령하기
        </button>
      ) : (
        <button
          onClick={onProgress}
          className="w-full py-2 rounded-lg font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:scale-95 transition-all"
        >
          진행하기
        </button>
      )}
    </div>
  );
}
