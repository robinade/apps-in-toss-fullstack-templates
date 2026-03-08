import { DemoLayout } from './components/DemoLayout';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useEventLogStore } from './stores/eventLogStore';

export default function App() {
  const { network, refresh } = useNetworkStatus();
  const { events } = useEventLogStore();

  return (
    <DemoLayout
      title="네트워크 상태"
      description="온/오프라인 상태 실시간 감지"
      statusItems={[
        {
          label: '연결 상태',
          value: network.isOnline ? '온라인' : '오프라인',
          variant: network.isOnline ? 'success' : 'error',
        },
        { label: '타입', value: network.type },
        {
          label: '마지막 확인',
          value: new Date(network.lastChecked).toLocaleTimeString(),
        },
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        <div
          className={`p-6 rounded-xl text-center ${
            network.isOnline ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <p className="text-4xl mb-2">{network.isOnline ? '🟢' : '🔴'}</p>
          <p className="text-lg font-bold">
            {network.isOnline ? '온라인' : '오프라인'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            네트워크 변경 시 자동 감지됩니다
          </p>
        </div>
        <button
          onClick={refresh}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 transition-colors"
        >
          상태 새로고침
        </button>
      </div>
    </DemoLayout>
  );
}
