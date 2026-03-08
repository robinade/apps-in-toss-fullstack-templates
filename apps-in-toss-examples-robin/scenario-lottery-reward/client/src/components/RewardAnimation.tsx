import { motion, AnimatePresence } from 'motion/react';

interface RewardAnimationProps {
  isVisible: boolean;
  amount: number;
}

export function RewardAnimation({ isVisible, amount }: RewardAnimationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-6xl font-bold text-amber-500"
            initial={{ scale: 0, y: 0 }}
            animate={{ scale: [0, 1.5, 1], y: [0, -50, -100] }}
            exit={{ opacity: 0, y: -150 }}
            transition={{ duration: 1.5 }}
          >
            +{amount}P
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
