import { DemoLayout } from './components/DemoLayout';
import { useHaptic } from './hooks/useHaptic';
import { useEventLogStore } from './stores/eventLogStore';

const HAPTIC_TYPES = [
  { type: 'light' as const, label: 'Light', description: '가벼운 터치', color: 'bg-blue-100 text-blue-700' },
  { type: 'medium' as const, label: 'Medium', description: '보통 터치', color: 'bg-indigo-100 text-indigo-700' },
  { type: 'heavy' as const, label: 'Heavy', description: '강한 터치', color: 'bg-purple-100 text-purple-700' },
  { type: 'selection' as const, label: 'Selection', description: '선택 피드백', color: 'bg-pink-100 text-pink-700' },
];

export default function App() {
  const { trigger } = useHaptic();
  const { events } = useEventLogStore();

  return (
    <DemoLayout
      title="햅틱 피드백"
      description="4가지 타입의 햅틱 피드백 트리거 예제"
      eventLog={events}
    >
      <div className="grid grid-cols-2 gap-3">
        {HAPTIC_TYPES.map(({ type, label, description, color }) => (
          <button
            key={type}
            onClick={() => trigger(type)}
            className={`p-4 rounded-xl ${color} active:scale-95 transition-transform`}
          >
            <p className="text-lg font-bold">{label}</p>
            <p className="text-xs opacity-70">{description}</p>
          </button>
        ))}
      </div>
    </DemoLayout>
  );
}
