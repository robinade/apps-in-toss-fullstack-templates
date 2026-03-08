import { DemoLayout } from './components/DemoLayout';
import { usePushNotification } from './hooks/usePushNotification';
import { useEventLogStore } from './stores/eventLogStore';
import { useState } from 'react';

export default function App() {
  const { loading, lastResult, sendTestPush } = usePushNotification();
  const { events } = useEventLogStore();
  const [title, setTitle] = useState('테스트 알림');
  const [body, setBody] = useState('앱에서 보낸 푸시 알림입니다!');
  const [userId, setUserId] = useState('test-user-001');

  const handleSend = () => {
    sendTestPush({ title, body, targetUserId: userId });
  };

  return (
    <DemoLayout
      title="푸시 알림"
      description="서버 API를 통한 푸시 알림 발송 예제"
      statusItems={[
        { label: '상태', value: loading ? '발송 중' : '대기' },
        ...(lastResult ? [{
          label: '결과',
          value: lastResult.success ? '성공' : '실패',
          variant: (lastResult.success ? 'success' : 'error') as 'success' | 'error',
        }] : []),
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        <input
          type="text"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          placeholder="대상 유저 ID"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="알림 제목"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="알림 내용"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />

        <button
          onClick={handleSend}
          disabled={loading || !title || !body}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? '발송 중...' : '테스트 알림 보내기'}
        </button>

        {lastResult?.success && (
          <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
            발송 성공! (ID: {lastResult.messageId})
          </div>
        )}
      </div>
    </DemoLayout>
  );
}
