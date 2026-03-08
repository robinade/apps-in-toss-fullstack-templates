---
name: appintoss-banner-ad
description: Implement AppsInToss (Toss mini-app) v2 banner ads using TossAds SDK. Generates production-ready useTossBanner hook, BannerAdWrapper component, and proper SDK initialization. Use proactively when the user mentions banner ads in Toss mini-apps, TossAds, AppsInToss advertising, 앱인토스 배너광고, 배너 광고 구현, or wants to add banner ad monetization to a Toss WebView or React Native mini-app. Also use when integrating ad revenue into any apps-in-toss project.
---

# AppsInToss Banner Ad v2 Implementation

Implement TossAds v2 banner ads in any AppsInToss mini-app project. This skill generates a complete, production-ready banner ad system following the official SDK patterns.

## Quick Reference

| Item | Value |
|------|-------|
| SDK (WebView) | `@apps-in-toss/web-framework` **>= 1.11.0** |
| SDK (React Native) | `@apps-in-toss/framework` |
| Min Toss version | 5.241.0 |
| Test ID (list) | `ait-ad-test-banner-id` |
| Test ID (feed) | `ait-ad-test-native-image-id` |
| Container size | `width: 100%`, `height: 96px` (fixed) |

> **CRITICAL: SDK Version Requirement**
> `TossAds.attachBanner()` requires `@apps-in-toss/web-framework` >= **1.11.0**.
> Older versions (< 1.11.0) only export `TossAds.attach()` and will cause **build errors**.
> **Before generating code, always check `package.json` and upgrade if needed:**
> ```bash
> npm install @apps-in-toss/web-framework@latest
> ```

For full API types and signatures, see [references/api-reference.md](references/api-reference.md).

## Architecture Overview

```
TossAds.initialize()  →  onInitialized callback
        ↓
TossAds.attachBanner(adGroupId, element, options)
        ↓
  onAdRendered → onAdViewable → onAdImpression → onAdClicked
        ↓
  Auto-refresh every 10s or on visibility change
        ↓
  destroy() on unmount
```

Three files to generate:
1. **`useTossBanner.ts`** — Hook: SDK init + banner attachment helper
2. **`BannerAdWrapper.tsx`** — Component: renders banner or DEV placeholder
3. **Ad Group ID constants** — DEV/PROD separation

## Implementation Workflow

### Step 1: Detect project platform and verify SDK version

Determine which SDK package the project uses:

**WebView project?** → `@apps-in-toss/web-framework`
**React Native project?** → `@apps-in-toss/framework`

Check `package.json` for the installed package. All code examples below use the WebView SDK. For React Native, swap the import path.

**CRITICAL: Verify SDK version >= 1.11.0**

```bash
# Check installed version
cat node_modules/@apps-in-toss/web-framework/package.json | grep '"version"'

# If < 1.11.0, upgrade first:
npm install @apps-in-toss/web-framework@latest
```

If the version is < 1.11.0, `TossAds.attachBanner` does NOT exist (only `TossAds.attach`).
This will cause TypeScript build errors. Always upgrade before proceeding.

### Step 2: Create the `useTossBanner` hook

This hook handles SDK initialization (once per app) and provides an `attachBanner` helper.

```typescript
// hooks/useTossBanner.ts
import { useCallback, useEffect, useState } from 'react';
import { TossAds, type TossAdsAttachBannerOptions } from '@apps-in-toss/web-framework';

export function useTossBanner() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;

    if (!TossAds.initialize.isSupported()) {
      console.warn('[TossAds] Banner ad SDK not supported in this environment.');
      return;
    }

    TossAds.initialize({
      callbacks: {
        onInitialized: () => {
          console.log('[TossAds] SDK initialized');
          setIsInitialized(true);
        },
        onInitializationFailed: (error) => {
          console.error('[TossAds] SDK init failed:', error);
        },
      },
    });
  }, [isInitialized]);

  const attachBanner = useCallback(
    (adGroupId: string, element: HTMLElement, options?: TossAdsAttachBannerOptions) => {
      if (!isInitialized) return;
      return TossAds.attachBanner(adGroupId, element, options);
    },
    [isInitialized],
  );

  return { isInitialized, attachBanner };
}
```

**Key rules:**
- Initialize once. The hook guards against duplicate init via `isInitialized` state.
- Always call `isSupported()` before `initialize()`.
- The hook is safe to call from multiple components — only the first triggers init.

### Step 3: Create the `BannerAdWrapper` component

```tsx
// components/BannerAdWrapper.tsx
import { useEffect, useRef } from 'react';
import { TossAds } from '@apps-in-toss/web-framework';
import { useTossBanner } from '@/hooks/useTossBanner';

/** Detect Toss WebView environment */
const isTossEnvironment = () =>
  !!(window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView;

interface BannerAdWrapperProps {
  className?: string;
  /** Ad group ID from AppsInToss console */
  adGroupId: string;
  /** 'fixed' = bottom-fixed 96px, 'inline' = auto height between content */
  mode?: 'fixed' | 'inline';
}

export function BannerAdWrapper({
  className,
  adGroupId,
  mode = 'fixed',
}: BannerAdWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isInitialized, attachBanner } = useTossBanner();

  useEffect(() => {
    if (!isInitialized || !containerRef.current) return;

    if (!TossAds.attachBanner.isSupported()) {
      console.warn('[BannerAd] attachBanner not supported.');
      return;
    }

    const attached = attachBanner(adGroupId, containerRef.current, {
      theme: 'auto',
      tone: 'blackAndWhite',
      variant: 'expanded',
      callbacks: {
        onAdRendered: (payload) =>
          console.log('[BannerAd] Rendered:', payload.slotId),
        onAdViewable: (payload) =>
          console.log('[BannerAd] Viewable:', payload.slotId),
        onAdImpression: (payload) =>
          console.log('[BannerAd] Impression (revenue):', payload.slotId),
        onAdClicked: (payload) =>
          console.log('[BannerAd] Clicked:', payload.slotId),
        onNoFill: (payload) =>
          console.warn('[BannerAd] No fill:', payload.slotId),
        onAdFailedToRender: (payload) =>
          console.error('[BannerAd] Render failed:', payload.error.message),
      },
    });

    return () => {
      attached?.destroy();
    };
  }, [isInitialized, adGroupId, attachBanner]);

  // DEV placeholder when not in Toss app
  if (!isTossEnvironment()) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: mode === 'fixed' ? 96 : 'auto',
          minHeight: mode === 'inline' ? 50 : undefined,
          backgroundColor: '#f0f0f0',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#aaa',
          fontSize: 12,
        }}
      >
        Banner Ad Placeholder ({mode})
      </div>
    );
  }

  // Real Toss environment
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: mode === 'fixed' ? '96px' : undefined,
      }}
    />
  );
}
```

**Key rules:**
- Container `width` must be `100%` (never a fixed pixel value).
- Fixed mode: `height: 96px`. Inline mode: no height (SDK auto-sizes).
- The container element must be empty — the SDK injects ad content.
- Always call `destroy()` in the cleanup function to prevent memory leaks.
- Provide a DEV placeholder so the layout is testable outside Toss app.

### Step 4: Define Ad Group IDs

Separate test and production IDs. Production IDs come from the AppsInToss console.

```typescript
// lib/adConstants.ts (or inline in the component)

// Test IDs (official)
export const BANNER_AD_TEST_LIST = 'ait-ad-test-banner-id';
export const BANNER_AD_TEST_FEED = 'ait-ad-test-native-image-id';

// Production IDs (replace with your own from AppsInToss console)
export const BANNER_AD_PROD_TEXT = 'ait.v2.live.YOUR_TEXT_AD_ID';
export const BANNER_AD_PROD_IMAGE = 'ait.v2.live.YOUR_IMAGE_AD_ID';

// Environment-aware selector
export const getBannerAdGroupId = (variant: 'text' | 'image' = 'text') => {
  if (import.meta.env.DEV) {
    return variant === 'text' ? BANNER_AD_TEST_LIST : BANNER_AD_TEST_FEED;
  }
  return variant === 'text' ? BANNER_AD_PROD_TEXT : BANNER_AD_PROD_IMAGE;
};
```

### Step 5: Use in pages

```tsx
// Example: Footer banner
import { BannerAdWrapper } from '@/components/BannerAdWrapper';
import { getBannerAdGroupId } from '@/lib/adConstants';

function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{/* page content */}</main>
      <BannerAdWrapper
        adGroupId={getBannerAdGroupId('text')}
        mode="fixed"
      />
    </div>
  );
}

// Example: Inline banner between content
function FeedPage() {
  return (
    <div>
      <FeedItem />
      <BannerAdWrapper
        adGroupId={getBannerAdGroupId('image')}
        mode="inline"
      />
      <FeedItem />
    </div>
  );
}
```

## Style Presets

| Option | Values | Default | Notes |
|--------|--------|---------|-------|
| `theme` | `'auto'` \| `'light'` \| `'dark'` | `'auto'` | Auto follows system dark mode |
| `tone` | `'blackAndWhite'` \| `'grey'` | `'blackAndWhite'` | Background color tone |
| `variant` | `'card'` \| `'expanded'` | `'expanded'` | `card` adds padding + border-radius |

## Critical Rules

1. **Initialize once** at app root level, not per component.
2. **`isSupported()` before every API call** — `initialize.isSupported()`, `attachBanner.isSupported()`.
3. **Container width must be 100%** — never a fixed pixel width.
4. **Call `destroy()` on unmount** — prevents memory leaks.
5. **Container element must be empty** — do not put children inside the banner container.
6. **Handle all 6 callbacks** — especially `onNoFill` and `onAdFailedToRender` for graceful degradation.
7. **Toss app 5.241.0+ required** — use `getTossAppVersion()` for version gating if needed.
8. **DEV placeholder** — always provide a visible placeholder for browser development.
9. **Auto-refresh** — SDK refreshes banners after 10s or on visibility change (background→foreground). No manual refresh needed.
10. **Test with official test IDs** in development, production IDs only in prod builds.

## Environment Detection

```typescript
// WebView environment (Toss app)
const isTossEnvironment = () =>
  !!(window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView;
```

When not in the Toss environment, render a placeholder. This enables local browser development without the SDK crashing.

## Conditional Workflow

**Adding banner to existing project?**
→ Check if `useTossBanner` hook already exists. If so, reuse it. Only create `BannerAdWrapper` and place it in the page.

**New project from scratch?**
→ Create all three files (hook, component, constants) and add the component to the desired pages.

**React Native project?**
→ Swap `@apps-in-toss/web-framework` → `@apps-in-toss/framework`. The API is identical. For React Native, use `View` component instead of `div` for the container, and `TossAds.BannerAdView` component if available.

## Cleanup on Page Navigation

When using single-page routing, destroy all banners on navigation:

```typescript
useEffect(() => {
  return () => {
    if (TossAds.destroyAll.isSupported()) {
      TossAds.destroyAll();
    }
  };
}, []);
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Fixed width container (`320px`) | Use `width: 100%` |
| Missing `destroy()` cleanup | Add cleanup in `useEffect` return |
| Calling `attachBanner` before init | Wait for `onInitialized` callback |
| Multiple `initialize()` calls | Guard with state flag, init once |
| No `isSupported()` check | Always check before calling SDK APIs |
| Children inside banner container | Keep the container element empty |
