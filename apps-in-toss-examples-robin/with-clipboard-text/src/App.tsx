import { DemoLayout } from './components/DemoLayout';
import { useClipboard } from './hooks/useClipboard';
import { useEventLogStore } from './stores/eventLogStore';
import { useState } from 'react';

export default function App() {
  const { copiedText, pastedText, loading, setText, getText } = useClipboard();
  const { events } = useEventLogStore();
  const [input, setInput] = useState('안녕하세요! 클립보드 테스트입니다.');

  return (
    <DemoLayout
      title="클립보드"
      description="텍스트 복사/붙여넣기 예제"
      statusItems={[
        { label: '상태', value: loading ? '처리 중' : '대기' },
        ...(copiedText ? [{ label: '마지막 복사', value: copiedText.slice(0, 20), variant: 'success' as const }] : []),
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={3}
          placeholder="복사할 텍스트를 입력하세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setText(input)}
            disabled={loading || !input}
            className="py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
          >
            복사
          </button>
          <button
            onClick={getText}
            disabled={loading}
            className="py-3 border border-indigo-300 text-indigo-600 rounded-xl font-semibold text-sm disabled:opacity-50"
          >
            붙여넣기
          </button>
        </div>

        {pastedText && (
          <div className="p-3 bg-green-50 rounded-lg">
            <h3 className="text-sm font-semibold text-green-700 mb-1">붙여넣은 텍스트</h3>
            <p className="text-xs text-green-600 break-all">{pastedText}</p>
          </div>
        )}
      </div>
    </DemoLayout>
  );
}
