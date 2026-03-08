import { DemoLayout } from './components/DemoLayout';
import { getEnvironment } from './lib/environment';

export default function App() {
  const env = getEnvironment();

  return (
    <DemoLayout
      title="Template"
      description="AppsInToss SDK 2.0.1 예제 템플릿"
      statusItems={[
        { label: '환경', value: env, variant: env === 'toss' ? 'success' : 'default' },
        { label: 'SDK', value: '2.0.1' },
        { label: 'React', value: '19.2.3' },
      ]}
    >
      <p className="text-sm text-gray-600">
        이 템플릿을 복사하여 새 예제를 만드세요.
      </p>
    </DemoLayout>
  );
}
