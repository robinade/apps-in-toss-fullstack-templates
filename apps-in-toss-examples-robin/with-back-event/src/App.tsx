import { DemoLayout } from './components/DemoLayout';
import { useBackEvent } from './hooks/useBackEvent';
import { useEventLogStore } from './stores/eventLogStore';

export default function App() {
  const { intercepting, backCount, showConfirm, startIntercepting, stopIntercepting, confirmExit, cancelExit } = useBackEvent();
  const { events } = useEventLogStore();

  return (
    <DemoLayout
      title="뒤로가기 이벤트"
      description="뒤로가기 버튼 가로채기 + 확인 모달"
      statusItems={[
        { label: '가로채기', value: intercepting ? '활성' : '비활성', variant: intercepting ? 'success' : 'default' },
        { label: '감지 횟수', value: `${backCount}회` },
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        <button
          onClick={intercepting ? stopIntercepting : startIntercepting}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
            intercepting ? 'bg-red-600 text-white active:bg-red-700' : 'bg-indigo-600 text-white active:bg-indigo-700'
          }`}
        >
          {intercepting ? '가로채기 중지' : '뒤로가기 가로채기 시작'}
        </button>

        {intercepting && (
          <p className="text-xs text-center text-gray-500">
            뒤로가기 버튼을 누르면 확인 모달이 표시됩니다
          </p>
        )}

        {/* Confirm Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
              <h3 className="text-lg font-bold text-center">나가시겠습니까?</h3>
              <p className="text-sm text-gray-500 text-center">변경사항이 저장되지 않을 수 있습니다.</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={cancelExit} className="py-3 border border-gray-300 rounded-xl text-sm font-semibold">
                  취소
                </button>
                <button onClick={confirmExit} className="py-3 bg-red-600 text-white rounded-xl text-sm font-semibold">
                  나가기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DemoLayout>
  );
}
