interface AdModalProps {
  isOpen: boolean;
  isLoading: boolean;
  isShowing: boolean;
  onWatch: () => void;
  onClose: () => void;
}

export function AdModal({ isOpen, isLoading, isShowing, onWatch, onClose }: AdModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 text-center shadow-xl max-w-[280px] mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-4xl mb-3">📺</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">광고 시청하고 출석!</h3>
        <p className="text-sm text-gray-500 mb-4">
          {isShowing ? '광고 시청 중...' : '광고를 시청하면 출석 체크가 완료돼요'}
        </p>
        <button
          onClick={onWatch}
          disabled={isLoading || isShowing}
          className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
            isLoading || isShowing ? 'bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
          }`}
        >
          {isLoading ? '광고 로딩 중...' : isShowing ? '시청 중...' : '광고 시청하기'}
        </button>
      </div>
    </div>
  );
}
