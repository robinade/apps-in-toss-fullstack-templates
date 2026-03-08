import { DemoLayout } from './components/DemoLayout';
import { useLocationTracking } from './hooks/useLocationTracking';
import { useEventLogStore } from './stores/eventLogStore';

export default function App() {
  const { tracking, points, error, startTracking, stopTracking, clearHistory } = useLocationTracking();
  const { events } = useEventLogStore();
  const latest = points[0];

  return (
    <DemoLayout
      title="위치 추적"
      description="실시간 위치 추적 시작/중지 예제"
      statusItems={[
        { label: '추적 상태', value: tracking ? '추적 중' : '중지', variant: tracking ? 'success' : 'default' },
        { label: '기록 포인트', value: `${points.length}개` },
        ...(latest ? [{ label: '최신 위치', value: `${latest.latitude.toFixed(4)}, ${latest.longitude.toFixed(4)}` }] : []),
        ...(error ? [{ label: '오류', value: error, variant: 'error' as const }] : []),
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={startTracking}
            disabled={tracking}
            className="py-3 bg-green-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
          >
            추적 시작
          </button>
          <button
            onClick={stopTracking}
            disabled={!tracking}
            className="py-3 bg-red-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
          >
            추적 중지
          </button>
        </div>

        {points.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold">경로 기록</h3>
              <button onClick={clearHistory} className="text-xs text-red-500">초기화</button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {points.slice(0, 20).map((p, i) => (
                <div key={i} className="text-xs font-mono text-gray-600 flex justify-between">
                  <span>{p.latitude.toFixed(6)}, {p.longitude.toFixed(6)}</span>
                  <span className="text-gray-400">{new Date(p.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DemoLayout>
  );
}
