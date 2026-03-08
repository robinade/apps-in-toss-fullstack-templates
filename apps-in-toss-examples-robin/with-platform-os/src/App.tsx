import { DemoLayout } from './components/DemoLayout';
import { usePlatformOS } from './hooks/usePlatformOS';
import { useEventLogStore } from './stores/eventLogStore';

export default function App() {
  const { platform, refresh } = usePlatformOS();
  const { events } = useEventLogStore();

  return (
    <DemoLayout
      title="플랫폼 감지"
      description="iOS/Android 플랫폼 감지 및 조건부 UI"
      statusItems={[
        { label: 'OS', value: platform?.os ?? '감지 중', variant: platform ? 'success' : 'default' },
        { label: 'iOS', value: platform?.isIOS ? '예' : '아니오' },
        { label: 'Android', value: platform?.isAndroid ? '예' : '아니오' },
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        {platform && (
          <div className="p-4 rounded-lg text-center" style={{ background: platform.isIOS ? '#f0f0f5' : platform.isAndroid ? '#e8f5e9' : '#f5f5f5' }}>
            <p className="text-3xl mb-1">{platform.isIOS ? '🍎' : platform.isAndroid ? '🤖' : '🖥️'}</p>
            <p className="text-lg font-bold">{platform.os.toUpperCase()}</p>
            <p className="text-xs text-gray-500 mt-1">
              {platform.isIOS ? 'iOS 스타일 UI 적용' : platform.isAndroid ? 'Material 스타일 UI 적용' : '기본 스타일 적용'}
            </p>
          </div>
        )}
        <button onClick={refresh} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 transition-colors">
          다시 감지
        </button>
      </div>
    </DemoLayout>
  );
}
