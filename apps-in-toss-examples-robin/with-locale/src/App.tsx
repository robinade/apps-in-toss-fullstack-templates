import { DemoLayout } from './components/DemoLayout';
import { useLocale } from './hooks/useLocale';
import { useEventLogStore } from './stores/eventLogStore';

export default function App() {
  const { localeInfo, t, refresh } = useLocale();
  const { events } = useEventLogStore();

  return (
    <DemoLayout
      title="언어/지역 설정"
      description="앱 언어 감지 + 다국어 UI 대응"
      statusItems={[
        { label: '언어', value: localeInfo?.language ?? '감지 중' },
        { label: '지역', value: localeInfo?.region || '-' },
        { label: 'Locale', value: localeInfo?.locale ?? '-', variant: 'success' },
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        <div className="p-4 bg-indigo-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-indigo-600">{t('greeting')}</p>
          <p className="text-sm text-gray-600 mt-1">{t('welcome')}</p>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">지원 언어별 인사</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">한국어</span><span>안녕하세요!</span></div>
            <div className="flex justify-between"><span className="text-gray-500">English</span><span>Hello!</span></div>
            <div className="flex justify-between"><span className="text-gray-500">日本語</span><span>こんにちは!</span></div>
          </div>
        </div>

        <button onClick={refresh} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 transition-colors">
          {t('button')}
        </button>
      </div>
    </DemoLayout>
  );
}
