import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RewardToastProps {
  isVisible: boolean;
  reward: number;
  streakBonus: number;
  onClose: () => void;
}

export function RewardToast({ isVisible, reward, streakBonus, onClose }: RewardToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white rounded-xl px-6 py-3 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <p className="font-bold text-center">
            출석 완료! +{reward}P
            {streakBonus > 0 && ` (연속 보너스 +${streakBonus}P)`}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
