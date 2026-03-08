import { useState } from 'react';

interface WithdrawModalProps {
  isOpen: boolean;
  balance: number;
  isWithdrawing: boolean;
  onWithdraw: (amount: number) => void;
  onClose: () => void;
}

export function WithdrawModal({ isOpen, balance, isWithdrawing, onWithdraw, onClose }: WithdrawModalProps) {
  const [amount, setAmount] = useState(10);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 shadow-xl max-w-[300px] mx-4 w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">포인트 출금</h3>

        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-center">
          <p className="text-xs text-gray-500">보유 포인트</p>
          <p className="text-2xl font-bold text-indigo-600">{balance}P</p>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-1 block">출금 금액</label>
          <input
            type="number"
            min={10}
            max={balance}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg p-2 text-center text-lg font-bold"
          />
          <p className="text-xs text-gray-400 mt-1">최소 10P부터 출금 가능</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[10, 50, 100].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(Math.min(v, balance))}
              className="py-1 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {v}P
            </button>
          ))}
        </div>

        <button
          onClick={() => onWithdraw(amount)}
          disabled={isWithdrawing || amount < 10 || amount > balance}
          className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
            isWithdrawing || amount < 10 || amount > balance
              ? 'bg-gray-300'
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
          }`}
        >
          {isWithdrawing ? '출금 중...' : '출금하기'}
        </button>
      </div>
    </div>
  );
}
