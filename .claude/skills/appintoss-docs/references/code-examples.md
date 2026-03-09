# AppsInToss Code Examples

Production-ready patterns extracted from reference implementations.

## Contents

- Environment Detection — `isTossApp()`, `getEnvironment()`
- Auth Login Hook — `useAuth()` with mock fallback
- Rewarded Ad Hook — `useRewardedAd()` with load/show lifecycle
- In-App Purchase Hook — `useIAP()` with product fetch + purchase
- Share Link Hook — `useShareLink()` with deep link generation
- Banner Ad Hook — `useBannerAd()` with TossAds initialization
- App.tsx Intro Pattern — correct intro-first flow

---

## Environment Detection

```typescript
// lib/environment.ts
export type AppEnvironment = 'toss' | 'sandbox' | 'web';

export function isTossApp(): boolean {
  const ua = navigator.userAgent;
  return ua.includes('TossApp') || ua.includes('AppsInToss');
}

export function getEnvironment(): AppEnvironment {
  const ua = navigator.userAgent;
  if (ua.includes('SANDBOX') || ua.includes('sandbox')) return 'sandbox';
  if (ua.includes('TossApp') || ua.includes('AppsInToss')) return 'toss';
  return 'web';
}
```

---

## Auth Login Hook

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [state, setState] = useState({
    isLoggedIn: false, authCode: null, token: null, userInfo: null, error: null,
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async () => {
    setLoading(true);
    try {
      if (!isTossApp()) {
        // Mock login for web dev
        await new Promise(r => setTimeout(r, 1500));
        setState({
          isLoggedIn: true,
          authCode: 'mock-' + Date.now(),
          token: 'mock-jwt-' + Date.now(),
          userInfo: { id: 'mock-001', name: '테스트 유저' },
          error: null,
        });
        return;
      }

      // Real SDK login
      const { appLogin } = await import('@apps-in-toss/web-framework');
      const { authorizationCode, referrer } = await appLogin();

      // Exchange auth code for token (your backend)
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorizationCode }),
      });
      if (!response.ok) throw new Error('Token exchange failed');

      const { token, user } = await response.json();
      setState({ isLoggedIn: true, authCode: authorizationCode, token, userInfo: user, error: null });
    } catch (error) {
      setState(s => ({ ...s, error: error instanceof Error ? error.message : String(error) }));
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setState({ isLoggedIn: false, authCode: null, token: null, userInfo: null, error: null });
  }, []);

  return { ...state, loading, login, logout };
}
```

---

## Rewarded Ad Hook

```typescript
// hooks/useRewardedAd.ts
let _loadFn = null;
let _showFn = null;

export function useRewardedAd(adGroupId: string) {
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const loadCleanupRef = useRef(undefined);
  const callbacksRef = useRef({});

  const checkSupport = useCallback(async () => {
    if (!isTossApp()) return false;
    try {
      if (!_loadFn || !_showFn) {
        const sdk = await import('@apps-in-toss/web-framework');
        _loadFn = sdk.loadFullScreenAd;
        _showFn = sdk.showFullScreenAd;
      }
      return _loadFn.isSupported() && _showFn.isSupported();
    } catch { return false; }
  }, []);

  const loadAd = useCallback(async () => {
    setLoading(true);
    setIsReady(false);
    const supported = await checkSupport();

    if (!supported) {
      // Mock for dev
      if (import.meta.env.DEV) {
        await new Promise(r => setTimeout(r, 1000));
        setIsReady(true);
      }
      setLoading(false);
      return;
    }

    loadCleanupRef.current?.();
    const cleanup = _loadFn({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === 'loaded') { setLoading(false); setIsReady(true); }
      },
      onError: () => { setLoading(false); },
    });
    loadCleanupRef.current = cleanup;
  }, [adGroupId, checkSupport]);

  useEffect(() => { loadAd(); return () => loadCleanupRef.current?.(); }, [loadAd]);

  const showAd = useCallback(async (callbacks) => {
    if (loading || !isReady) return false;
    callbacksRef.current = callbacks;
    const supported = await checkSupport();

    if (!supported && import.meta.env.DEV) {
      setIsReady(false);
      setTimeout(() => {
        callbacks.onRewarded?.('coin', 1);
        setTimeout(() => { callbacks.onDismiss?.(); loadAd(); }, 500);
      }, 2000);
      return true;
    }

    setIsReady(false);
    _showFn({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === 'userEarnedReward') {
          callbacksRef.current.onRewarded?.(event.data.unitType, event.data.unitAmount);
        } else if (event.type === 'dismissed' || event.type === 'failedToShow') {
          if (event.type === 'dismissed') callbacksRef.current.onDismiss?.();
          loadAd();
        }
      },
      onError: (error) => { callbacksRef.current.onError?.(new Error(String(error))); loadAd(); },
    });
    return true;
  }, [loading, isReady, adGroupId, checkSupport, loadAd]);

  return { loading, isReady, loadAd, showAd };
}
```

---

## In-App Purchase Hook

```typescript
// hooks/useIAP.ts
export function useIAP() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async (productIds: string[]) => {
    setLoading(true);
    try {
      if (!isTossApp()) {
        // Mock products for dev
        setProducts(productIds.map(id => ({
          productId: id, title: `상품 ${id}`, description: '설명', price: 1100, currency: 'KRW',
        })));
        return;
      }

      const { getProductItemList } = await import('@apps-in-toss/web-framework');
      if (!getProductItemList.isSupported()) throw new Error('Not supported');
      const result = await getProductItemList({ options: { productIds } });
      setProducts(result.productItems);
    } catch (error) { console.error('Fetch products failed:', error); }
    finally { setLoading(false); }
  }, []);

  const purchase = useCallback(async (productId: string) => {
    setLoading(true);
    try {
      if (!isTossApp()) {
        await new Promise(r => setTimeout(r, 2000));
        return { orderId: 'mock-' + Date.now(), productId, purchaseTime: Date.now() };
      }

      const { createOneTimePurchaseOrder } = await import('@apps-in-toss/web-framework');
      if (!createOneTimePurchaseOrder.isSupported()) throw new Error('Not supported');
      return await createOneTimePurchaseOrder({ options: { productId } });
    } catch (error) { console.error('Purchase failed:', error); return null; }
    finally { setLoading(false); }
  }, []);

  return { products, loading, fetchProducts, purchase };
}
```

---

## Share Link Hook

```typescript
// hooks/useShareLink.ts
export function useShareLink() {
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateLink = useCallback(async (path: string, params?: Record<string, string>) => {
    setLoading(true);
    try {
      if (!isTossApp()) {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        const url = `https://toss.im/app/mock${path}${qs}`;
        setLink({ url, createdAt: Date.now() });
        return { url, createdAt: Date.now() };
      }

      const { getTossShareLink } = await import('@apps-in-toss/web-framework');
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      const deepLink = `intoss://${path}${qs}`;
      const shareUrl = await getTossShareLink(deepLink);
      const result = { url: shareUrl, createdAt: Date.now() };
      setLink(result);
      return result;
    } catch (error) { return null; }
    finally { setLoading(false); }
  }, []);

  return { link, loading, generateLink };
}
```

---

## Banner Ad Hook

```typescript
// hooks/useBannerAd.ts
import { TossAds } from '@apps-in-toss/web-framework'; // Banner uses static import

let _initialized = false;
let _initializing = false;

export function useBannerAd() {
  const [isInitialized, setIsInitialized] = useState(_initialized);

  useEffect(() => {
    if (_initialized) { setIsInitialized(true); return; }
    if (_initializing || !isTossApp()) return;
    if (!TossAds.initialize.isSupported()) return;

    _initializing = true;
    TossAds.initialize({
      callbacks: {
        onInitialized: () => { _initialized = true; _initializing = false; setIsInitialized(true); },
        onInitializationFailed: () => { _initializing = false; },
      },
    });
  }, []);

  const attachBanner = useCallback(
    (adGroupId: string, element: HTMLElement) => {
      if (!isInitialized) return;
      return TossAds.attachBanner(adGroupId, element);
    },
    [isInitialized],
  );

  return { isInitialized, attachBanner };
}
```

---

## App.tsx Intro Pattern

```typescript
// App.tsx — correct intro-first pattern
function App() {
  const [showIntro, setShowIntro] = useState(true);

  const handleStart = () => {
    setShowIntro(false);
    // Optionally trigger login here
  };

  if (showIntro) {
    return <IntroView onStart={handleStart} />;
  }

  return <MainView />;
}
```

Never call `appLogin()` in a top-level `useEffect`. Always show intro first.
