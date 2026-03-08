interface BalanceCardProps {
  balance: number;
  totalWithdrawn: number;
  canWithdraw: boolean;
  onWithdraw: () => void;
}

export function BalanceCard({ balance, totalWithdrawn, canWithdraw, onWithdraw }: BalanceCardProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-5 text-white">
      <p className="text-sm opacity-80">보유 포인트</p>
      <p className="text-3xl font-bold mt-1">{balance}P</p>
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs opacity-60">총 출금: {totalWithdrawn}P</p>
        <button
          onClick={onWithdraw}
          disabled={!canWithdraw}
          className={`text-sm font-bold px-4 py-1.5 rounded-full transition-all ${
            canWithdraw
              ? 'bg-white text-indigo-600 hover:bg-gray-100 active:scale-95'
              : 'bg-white/30 text-white/60 cursor-not-allowed'
          }`}
        >
          출금하기
        </button>
      </div>
    </div>
  );
}
