import { DemoLayout } from './components/DemoLayout';
import { useShareLink } from './hooks/useShareLink';
import { useEventLogStore } from './stores/eventLogStore';
import { useState } from 'react';

export default function App() {
  const { link, loading, generateLink, copyToClipboard } = useShareLink();
  const { events } = useEventLogStore();
  const [path, setPath] = useState('/invite');
  const [refCode, setRefCode] = useState('abc123');

  const handleGenerate = () => {
    generateLink(path, { ref: refCode });
  };

  return (
    <DemoLayout
      title="딥링크 공유"
      description="토스 딥링크를 생성하고 공유하는 예제"
      statusItems={[
        { label: '상태', value: loading ? '생성 중' : link ? '생성됨' : '대기', variant: link ? 'success' : 'default' },
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        <input
          type="text"
          value={path}
          onChange={e => setPath(e.target.value)}
          placeholder="경로 (예: /invite)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          value={refCode}
          onChange={e => setRefCode(e.target.value)}
          placeholder="추천 코드"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? '생성 중...' : '딥링크 생성'}
        </button>

        {link && (
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <p className="text-xs font-mono text-gray-600 break-all">{link.url}</p>
            <button
              onClick={copyToClipboard}
              className="w-full py-2 border border-indigo-300 text-indigo-600 rounded-lg text-xs font-semibold active:bg-indigo-50"
            >
              클립보드에 복사
            </button>
          </div>
        )}
      </div>
    </DemoLayout>
  );
}
