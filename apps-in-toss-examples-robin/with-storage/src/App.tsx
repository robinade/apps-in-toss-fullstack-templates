import { DemoLayout } from './components/DemoLayout';
import { useStorage } from './hooks/useStorage';
import { useEventLogStore } from './stores/eventLogStore';
import { useState, useEffect } from 'react';

export default function App() {
  const { items, loading, setItem, getItem, removeItem, clearAll } = useStorage();
  const { events } = useEventLogStore();
  const [name, setName] = useState('');
  const [memo, setMemo] = useState('');

  // Auto-restore on mount
  useEffect(() => {
    (async () => {
      const savedName = await getItem('name');
      const savedMemo = await getItem('memo');
      if (savedName) setName(savedName);
      if (savedMemo) setMemo(savedMemo);
    })();
  }, [getItem]);

  const handleSave = () => {
    setItem('name', name);
    setItem('memo', memo);
  };

  return (
    <DemoLayout
      title="네이티브 스토리지"
      description="setItem/getItem/removeItem/clearItems 예제"
      statusItems={[
        { label: '저장된 항목', value: `${items.length}개` },
        { label: '상태', value: loading ? '처리 중' : '대기', variant: loading ? 'error' : 'default' },
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="이름"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="메모"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          저장하기
        </button>

        {items.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg space-y-1">
            <h3 className="text-sm font-semibold mb-2">저장된 데이터</h3>
            {items.map(item => (
              <div key={item.key} className="flex justify-between items-center text-xs">
                <span className="font-mono text-gray-600">{item.key}: {item.value.slice(0, 30)}</span>
                <button onClick={() => removeItem(item.key)} className="text-red-500 text-xs">삭제</button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={clearAll}
          disabled={loading || items.length === 0}
          className="w-full py-2 border border-red-300 text-red-600 rounded-xl text-sm active:bg-red-50 transition-colors disabled:opacity-50"
        >
          전체 삭제
        </button>
      </div>
    </DemoLayout>
  );
}
