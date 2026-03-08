import { motion, AnimatePresence } from 'motion/react';

interface ResultModalProps {
  isOpen: boolean;
  tier: string;
  prizeName: string;
  prizeAmount: number;
  onClose: () => void;
}

const TIER_EMOJIS: Record<string, string> = {
  '1등': '🎉', '2등': '🎊', '3등': '👍', '4등': '😅', '꽝': '😢',
};

const TIER_COLORS: Record<string, string> = {
  '1등': 'text-yellow-500', '2등': 'text-purple-500', '3등': 'text-blue-500',
  '4등': 'text-gray-500', '꽝': 'text-gray-400',
};

export function ResultModal({ isOpen, tier, prizeName, prizeAmount, onClose }: ResultModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <AnimatePresence>
        <motion.div
          className="bg-white rounded-2xl p-6 text-center shadow-xl max-w-[280px] mx-4"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
        >
          <div className="text-5xl mb-3">{TIER_EMOJIS[tier] ?? '🎲'}</div>
          <h3 className={`text-2xl font-bold mb-1 ${TIER_COLORS[tier] ?? ''}`}>{tier}</h3>
          <p className="text-lg text-gray-700 mb-1">{prizeName}</p>
          {prizeAmount > 0 && (
            <p className="text-3xl font-bold text-amber-600">{prizeAmount}P</p>
          )}
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            확인
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
