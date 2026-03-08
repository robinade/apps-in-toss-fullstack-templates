import { useEffect } from 'react';

interface ClaimModalProps {
  isOpen: boolean;
  rewardAmount: number;
  missionTitle: string;
  onClose: () => void;
}

export function ClaimModal({ isOpen, rewardAmount, missionTitle, onClose }: ClaimModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 text-center shadow-xl max-w-[280px] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">보상 수령!</h3>
        <p className="text-sm text-gray-500 mb-2">{missionTitle}</p>
        <p className="text-2xl font-bold text-amber-600">{rewardAmount}P</p>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700"
        >
          확인
        </button>
      </div>
    </div>
  );
}
