import { cn } from '../lib/utils';

interface LotteryCardProps {
  chances: number;
  isDrawing: boolean;
  onDraw: () => void;
  onWatchAd: () => void;
  adReady: boolean;
  adLoading: boolean;
}

export function LotteryCard({ chances, isDrawing, onDraw, onWatchAd, adReady, adLoading }: LotteryCardProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-center text-white">
        <p className="text-sm opacity-80">남은 기회</p>
        <p className="text-4xl font-bold mt-1">{chances}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onDraw}
          disabled={chances <= 0 || isDrawing}
          className={cn(
            'py-3 rounded-xl font-bold text-white transition-all',
            chances > 0 && !isDrawing
              ? 'bg-amber-500 hover:bg-amber-600 active:scale-95'
              : 'bg-gray-300 cursor-not-allowed'
          )}
        >
          {isDrawing ? '뽑는 중...' : '복권 뽑기'}
        </button>

        <button
          onClick={onWatchAd}
          disabled={adLoading}
          className={cn(
            'py-3 rounded-xl font-bold transition-all',
            adReady
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
              : 'bg-gray-100 text-gray-400'
          )}
        >
          {adLoading ? '로딩...' : '광고 보고 +1'}
        </button>
      </div>
    </div>
  );
}
