import { AnimatePresence, motion } from 'motion/react';

interface CoachMarksProps {
  isActive: boolean;
  currentMark: number;
  totalMarks: number;
  targetRect: DOMRect | null;
  message: string;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function CoachMarks({
  isActive,
  currentMark,
  totalMarks,
  targetRect,
  message,
  onNext,
  onSkip,
  onComplete,
}: CoachMarksProps) {
  if (!isActive || !targetRect) return null;

  const isLast = currentMark === totalMarks - 1;
  const padding = 8;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay with spotlight hole */}
        <div
          className="absolute inset-0 bg-black/60"
          style={{
            maskImage: `radial-gradient(ellipse ${targetRect.width + padding * 2}px ${targetRect.height + padding * 2}px at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent 50%, black 51%)`,
            WebkitMaskImage: `radial-gradient(ellipse ${targetRect.width + padding * 2}px ${targetRect.height + padding * 2}px at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent 50%, black 51%)`,
          }}
        />

        {/* Tooltip */}
        <motion.div
          className="absolute bg-white rounded-xl p-4 shadow-lg max-w-[280px]"
          style={{
            left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 296)),
            top: targetRect.bottom + 16,
          }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentMark}
        >
          <p className="text-sm text-gray-700 mb-3">{message}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {currentMark + 1} / {totalMarks}
            </span>
            <div className="flex gap-2">
              <button
                onClick={onSkip}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                건너뛰기
              </button>
              <button
                onClick={isLast ? onComplete : onNext}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                {isLast ? '완료' : '다음'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
