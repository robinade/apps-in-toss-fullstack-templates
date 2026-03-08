import { DemoLayout } from './components/DemoLayout';
import { useAuth } from './hooks/useAuth';
import { useEventLogStore } from './stores/eventLogStore';

export default function App() {
  const { isLoggedIn, authCode, token, userInfo, error, loading, login, logout } = useAuth();
  const { events } = useEventLogStore();

  return (
    <DemoLayout
      title="토스 로그인"
      description="appLogin() → authCode → 서버 토큰 교환 흐름"
      statusItems={[
        { label: '로그인 상태', value: isLoggedIn ? '로그인됨' : '로그아웃', variant: isLoggedIn ? 'success' : 'default' },
        ...(userInfo ? [{ label: '유저 ID', value: userInfo.id }] : []),
        ...(userInfo ? [{ label: '이름', value: userInfo.name }] : []),
        ...(error ? [{ label: '오류', value: error, variant: 'error' as const }] : []),
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        {isLoggedIn && token && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold mb-1">토큰 (일부)</h3>
            <p className="text-xs text-gray-500 font-mono break-all">{token.slice(0, 30)}...</p>
          </div>
        )}

        {isLoggedIn && authCode && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold mb-1">Auth Code (일부)</h3>
            <p className="text-xs text-gray-500 font-mono break-all">{authCode.slice(0, 20)}...</p>
          </div>
        )}

        {!isLoggedIn ? (
          <button
            onClick={login}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '토스 로그인'}
          </button>
        ) : (
          <button
            onClick={logout}
            className="w-full py-3 border border-gray-300 rounded-xl text-sm text-gray-700 active:bg-gray-50 transition-colors"
          >
            로그아웃
          </button>
        )}
      </div>
    </DemoLayout>
  );
}
