import { DemoLayout } from './components/DemoLayout';
import { useEnvironment } from './hooks/useEnvironment';
import { useEventLogStore } from './stores/eventLogStore';

export default function App() {
  const { info, refresh } = useEnvironment();
  const { events, addEvent } = useEventLogStore();

  const handleRefresh = () => {
    refresh();
    addEvent('environment_refreshed', info);
  };

  if (!info) return <div className="p-4">감지 중...</div>;

  return (
    <DemoLayout
      title="환경 감지"
      description="현재 실행 환경(web/toss/sandbox)을 감지합니다"
      statusItems={[
        {
          label: '환경',
          value: info.environment,
          variant: info.isTossApp ? 'success' : 'default',
        },
        {
          label: 'ReactNativeWebView',
          value: info.hasReactNativeWebView ? '있음' : '없음',
          variant: info.hasReactNativeWebView ? 'success' : 'error',
        },
        {
          label: '화면 크기',
          value: `${info.windowSize.width} × ${info.windowSize.height}`,
        },
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">환경 상세</h3>
          <dl className="text-xs space-y-1">
            <div className="flex justify-between">
              <dt className="text-gray-500">토스 앱</dt>
              <dd>{info.isTossApp ? '예' : '아니오'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">샌드박스</dt>
              <dd>{info.isSandbox ? '예' : '아니오'}</dd>
            </div>
          </dl>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-1">User Agent</h3>
          <p className="text-xs text-gray-500 break-all">{info.userAgent}</p>
        </div>

        <button
          onClick={handleRefresh}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 transition-colors"
        >
          환경 다시 감지
        </button>
      </div>
    </DemoLayout>
  );
}
