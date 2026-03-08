import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../lib/utils';

interface OnboardingCardsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
}

const CARDS = [
  {
    title: '환영합니다!',
    description: '이 앱에서 다양한 기능을 체험할 수 있어요.',
    emoji: '👋',
    bg: 'bg-indigo-50',
  },
  {
    title: 'SDK 기능 체험',
    description: '광고, 공유, 결제 등 토스 SDK API를 직접 사용해보세요.',
    emoji: '🚀',
    bg: 'bg-green-50',
  },
  {
    title: '시작해볼까요?',
    description: '코치마크가 주요 기능을 안내해드릴게요.',
    emoji: '✨',
    bg: 'bg-amber-50',
  },
];

export function OnboardingCards({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onComplete,
}: OnboardingCardsProps) {
  const [direction, setDirection] = useState(1);
  const card = CARDS[currentStep];
  const isLast = currentStep === totalSteps - 1;

  const handleNext = () => {
    setDirection(1);
    if (isLast) {
      onComplete();
    } else {
      onNext();
    }
  };

  const handlePrev = () => {
    setDirection(-1);
    onPrev();
  };

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn('w-full max-w-sm rounded-2xl p-8 text-center', card?.bg)}
        >
          <div className="text-6xl mb-4">{card?.emoji}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{card?.title}</h2>
          <p className="text-sm text-gray-600">{card?.description}</p>
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      <div className="flex gap-2 mt-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              i === currentStep ? 'bg-indigo-600 w-6' : 'bg-gray-300'
            )}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-8 w-full max-w-sm">
        {currentStep > 0 && (
          <button
            onClick={handlePrev}
            className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
          >
            이전
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          {isLast ? '시작하기' : '다음'}
        </button>
      </div>
    </div>
  );
}
