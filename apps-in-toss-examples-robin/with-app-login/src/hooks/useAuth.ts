import { useCallback, useState } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

interface AuthState {
  isLoggedIn: boolean;
  authCode: string | null;
  referrer: 'DEFAULT' | 'SANDBOX' | null;
  token: string | null;
  userInfo: { id: string; name: string } | null;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    authCode: null,
    referrer: null,
    token: null,
    userInfo: null,
    error: null,
  });
  const [loading, setLoading] = useState(false);
  const { addEvent } = useEventLogStore();

  const login = useCallback(async () => {
    setLoading(true);
    setState(s => ({ ...s, error: null }));
    addEvent('login_start');

    try {
      if (!isTossApp()) {
        // Mock login for web dev
        addEvent('mock_login');
        await new Promise(r => setTimeout(r, 1500));
        const mockCode = 'mock-auth-code-' + Date.now();
        const mockToken = 'mock-jwt-token-' + Date.now();
        setState({
          isLoggedIn: true,
          authCode: mockCode,
          referrer: 'DEFAULT',
          token: mockToken,
          userInfo: { id: 'mock-user-001', name: '테스트 유저' },
          error: null,
        });
        addEvent('mock_login_success', { authCode: mockCode });
        setLoading(false);
        return;
      }

      // Real SDK login
      const { appLogin } = await import('@apps-in-toss/web-framework') as unknown as {
        appLogin: () => Promise<{ authorizationCode: string; referrer: 'DEFAULT' | 'SANDBOX' }>;
      };

      addEvent('sdk_login_calling');
      const { authorizationCode, referrer } = await appLogin();
      addEvent('auth_code_received', { authCode: authorizationCode.slice(0, 8) + '...', referrer });

      // Exchange auth code for token (call your backend)
      addEvent('token_exchange_start');
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorizationCode }),
      });

      if (!response.ok) throw new Error('Token exchange failed');

      const { token, user } = await response.json();
      setState({
        isLoggedIn: true,
        authCode: authorizationCode,
        referrer,
        token: token,
        userInfo: user,
        error: null,
      });
      addEvent('login_success', { userId: user.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setState(s => ({ ...s, error: message }));
      addEvent('login_error', { error: message });
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const logout = useCallback(() => {
    setState({
      isLoggedIn: false,
      authCode: null,
      referrer: null,
      token: null,
      userInfo: null,
      error: null,
    });
    addEvent('logout');
  }, [addEvent]);

  return { ...state, loading, login, logout };
}
