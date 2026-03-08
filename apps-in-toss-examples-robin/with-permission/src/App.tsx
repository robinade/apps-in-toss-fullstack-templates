import { DemoLayout } from './components/DemoLayout';
import { usePermission } from './hooks/usePermission';
import { useEventLogStore } from './stores/eventLogStore';
import { useEffect } from 'react';

const PERMISSION_ITEMS = [
  { type: 'camera' as const, label: '카메라', icon: '📷' },
  { type: 'location' as const, label: '위치', icon: '📍' },
  { type: 'contacts' as const, label: '연락처', icon: '👥' },
];

export default function App() {
  const { permissions, loading, requestPermission, checkAll } = usePermission();
  const { events } = useEventLogStore();

  useEffect(() => { checkAll(); }, [checkAll]);

  const getVariant = (status: string) => {
    if (status === 'granted') return 'success' as const;
    if (status === 'denied') return 'error' as const;
    return 'default' as const;
  };

  return (
    <DemoLayout
      title="권한 요청"
      description="카메라/위치/연락처 권한 확인 및 요청"
      statusItems={PERMISSION_ITEMS.map(item => ({
        label: item.label,
        value: permissions[item.type],
        variant: getVariant(permissions[item.type]),
      }))}
      eventLog={events}
    >
      <div className="space-y-2">
        {PERMISSION_ITEMS.map(item => (
          <div key={item.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-gray-500">{permissions[item.type]}</p>
              </div>
            </div>
            <button
              onClick={() => requestPermission(item.type)}
              disabled={loading || permissions[item.type] === 'granted'}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              {permissions[item.type] === 'granted' ? '허용됨' : '요청'}
            </button>
          </div>
        ))}

        <button
          onClick={checkAll}
          disabled={loading}
          className="w-full py-2 border border-gray-300 rounded-xl text-sm text-gray-700 mt-2 disabled:opacity-50"
        >
          전체 상태 확인
        </button>
      </div>
    </DemoLayout>
  );
}
