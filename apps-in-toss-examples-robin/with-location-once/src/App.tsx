import { DemoLayout } from './components/DemoLayout';
import { useLocationOnce } from './hooks/useLocationOnce';
import { useEventLogStore } from './stores/eventLogStore';

export default function App() {
  const { location, loading, error, getCurrentPosition } = useLocationOnce();
  const { events } = useEventLogStore();

  return (
    <DemoLayout
      title="위치 (1회)"
      description="현재 위치를 1회 가져오는 예제"
      statusItems={[
        { label: '상태', value: loading ? '측정 중' : location ? '완료' : '대기', variant: location ? 'success' : 'default' },
        ...(location ? [
          { label: '위도', value: location.latitude.toFixed(6) },
          { label: '경도', value: location.longitude.toFixed(6) },
          { label: '정확도', value: `${location.accuracy.toFixed(0)}m` },
        ] : []),
        ...(error ? [{ label: '오류', value: error, variant: 'error' as const }] : []),
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        {location && (
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-sm font-semibold text-green-700">현재 위치</p>
            <p className="text-xs text-green-600 font-mono mt-1">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              정확도: {location.accuracy.toFixed(0)}m | {new Date(location.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}
        <button
          onClick={getCurrentPosition}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? '측정 중...' : '현재 위치 가져오기'}
        </button>
      </div>
    </DemoLayout>
  );
}
