import { cn } from '../lib/utils';

interface ShareCardProps {
  todayShareCount: number;
  remainingShares: number;
  totalRewards: number;
  canShare: boolean;
  isSharing: boolean;
  onShare: () => void;
}

export function ShareCard({
  todayShareCount,
  remainingShares,
  totalRewards,
  canShare,
  isSharing,
  onShare,
}: ShareCardProps) {
  return (
    <div className="space-y-4">
      {/* 현황 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-indigo-600">{todayShareCount}</p>
          <p className="text-xs text-gray-500 mt-1">오늘 공유</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{remainingShares}</p>
          <p className="text-xs text-gray-500 mt-1">남은 횟수</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{totalRewards}</p>
          <p className="text-xs text-gray-500 mt-1">총 리워드</p>
        </div>
      </div>

      {/* 공유 버튼 */}
      <button
        onClick={onShare}
        disabled={!canShare || isSharing}
        className={cn(
          'w-full py-3 rounded-xl font-bold text-white transition-all',
          canShare && !isSharing
            ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            : 'bg-gray-300 cursor-not-allowed'
        )}
      >
        {isSharing ? '공유 중...' : canShare ? '친구에게 공유하기' : '오늘 공유 완료!'}
      </button>

      {!canShare && (
        <p className="text-sm text-gray-400 text-center">내일 다시 공유할 수 있어요</p>
      )}
    </div>
  );
}
