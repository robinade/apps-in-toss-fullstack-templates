import { cn } from '../lib/utils';

interface DemoLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  statusItems?: Array<{ label: string; value: string; variant?: 'default' | 'success' | 'error' }>;
  eventLog?: Array<{ timestamp: number; type: string; data?: unknown }>;
}

export function DemoLayout({ title, description, children, statusItems, eventLog }: DemoLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>

      {/* Status Panel */}
      {statusItems && statusItems.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">상태</h2>
          {statusItems.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{item.label}</span>
              <span className={cn(
                'font-medium',
                item.variant === 'success' && 'text-green-600',
                item.variant === 'error' && 'text-red-600',
                !item.variant && 'text-gray-900',
              )}>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Area */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        {children}
      </div>

      {/* Event Log */}
      {eventLog && eventLog.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">이벤트 로그</h2>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {eventLog.map((e, i) => (
              <div key={i} className="text-xs font-mono text-gray-600 flex gap-2">
                <span className="text-gray-400 shrink-0">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </span>
                <span className="font-semibold text-indigo-600">{e.type}</span>
                {e.data && <span className="text-gray-400 truncate">{JSON.stringify(e.data)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
