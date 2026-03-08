import { DemoLayout } from './components/DemoLayout';
import { BannerAd } from './components/BannerAd';
import { useEventLogStore } from './stores/eventLogStore';
import { BANNER_AD_CONFIG } from './lib/constants';
import { isTossApp } from './lib/environment';

export default function App() {
  const { events } = useEventLogStore();

  return (
    <DemoLayout
      title="배너 광고"
      description="TossAds v2 배너 광고 (고정형 + 인라인) 예제"
      statusItems={[
        { label: '환경', value: isTossApp() ? 'toss' : 'web', variant: isTossApp() ? 'success' : 'default' },
        { label: 'SDK', value: 'TossAds v2' },
      ]}
      eventLog={events}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">고정형 배너 (96px)</h3>
          <BannerAd
            adGroupId={BANNER_AD_CONFIG.TEST_BANNER_ID}
            type="fixed"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">인라인 배너 (자동 높이)</h3>
          <BannerAd
            adGroupId={BANNER_AD_CONFIG.TEST_NATIVE_IMAGE_ID}
            type="inline"
          />
        </div>
      </div>
    </DemoLayout>
  );
}
