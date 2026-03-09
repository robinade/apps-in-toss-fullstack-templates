---
name: appintoss-docs
description: >
  Complete AppsInToss (앱인토스) SDK reference for building Toss mini-apps
  with @apps-in-toss/web-framework. Covers all SDK APIs (login, ads, payments,
  share, storage, navigation, device), mandatory review rules that cause
  rejection if violated, production-ready code patterns, and TDS design system.
  Applies when implementing any AppsInToss feature, checking SDK API signatures,
  verifying review compliance, configuring granite.config.ts, or building Toss
  mini-apps. Key terms: 앱인토스, AppsInToss, 토스 로그인, TDS, 미니앱, Granite,
  인앱결제, 인앱광고, 프로모션, 배너광고, 리워드광고, 토스페이, SDK, 심사, 반려.
---

# AppsInToss SDK Reference

Reference for `@apps-in-toss/web-framework` 2.0.1 on Granite 1.0+ WebView.

## SDK Import Pattern

Every SDK call requires dynamic import + `isSupported()` check. Static imports crash in web and cause review rejection.

```typescript
// Correct — dynamic import
const { someAPI } = await import('@apps-in-toss/web-framework');
if (someAPI.isSupported() !== true) { /* mock or return */ }
const cleanup = someAPI({ options, onEvent, onError });
return () => cleanup?.();

// Wrong — static import causes crash + rejection
import { someAPI } from '@apps-in-toss/web-framework';
```

**Exception**: `TossAds` (banner ads) uses static import because it's a namespace object.

## API Quick Reference

### Authentication

| API | Returns |
|-----|---------|
| `appLogin()` | `{ authorizationCode, referrer }` |

Flow: User action → `appLogin()` → send `authorizationCode` to server → server exchanges via mTLS → server returns app JWT to client.

Show intro/landing screen first. Calling `appLogin()` on app start causes rejection.

### Advertising

| API | Purpose |
|-----|---------|
| `loadFullScreenAd({ options, onEvent, onError })` | Pre-load fullscreen ad |
| `showFullScreenAd({ options, onEvent, onError })` | Display loaded ad |
| `TossAds.initialize({ callbacks })` | Initialize banner SDK |
| `TossAds.attachBanner(adGroupId, element)` | Attach banner to DOM |

Load → Show order is mandatory (reverse causes rejection). Handle `userEarnedReward` event for rewarded ads: `event.data = { unitType, unitAmount }`.

### Payments

| API | Purpose |
|-----|---------|
| `getProductItemList({ options: { productIds } })` | Fetch product info |
| `createOneTimePurchaseOrder({ options: { productId } })` | Purchase item |

Before payment: show product name, quantity, total, refund policy. Pause media during payment.

### Share & Viral

| API | Purpose |
|-----|---------|
| `getTossShareLink(deepLink, ogImageUrl?)` | Generate Toss share link |
| `share({ title, text, url })` | Native share dialog |
| `contactsViral({ options })` | Contact-based viral invite |

Use `getTossShareLink()` for all links — sharing links to your own website causes rejection.

### Storage

| API | Purpose |
|-----|---------|
| `Storage.setItem(key, value)` | Save to native storage |
| `Storage.getItem(key)` | Read from native storage |
| `Storage.removeItem(key)` | Remove from native storage |

### Device & Environment

| API | Purpose |
|-----|---------|
| `getOperationalEnvironment()` | Detect: `toss` / `sandbox` / `web` |
| `requestPermission({ options })` | Request camera, location, etc. |
| `getDeviceLocale()` | Get device language/region |
| `getNetworkStatus()` | Check connectivity |
| `haptic({ type })` | Trigger haptic feedback |
| `openCamera({ options })` | Take photo |
| `openAlbum({ options })` | Pick from gallery |
| `setClipboardText({ text })` | Copy to clipboard |

### Promotion

| API | Purpose |
|-----|---------|
| `executePromotion` (server-side) | Grant Toss Points reward via mTLS |

## granite.config.ts Template

```typescript
export default {
  appName: 'my-app',
  brand: {
    displayName: '내 앱이름',    // Must match <title> exactly
    primaryColor: '#3182F6',     // 6-digit hex with #
  },
  navigationBar: {
    withBackButton: true,        // Required
    withHomeButton: true,        // Required
    initialAccessoryButton: {    // Optional, max 1
      id: 'action',
      title: 'Action',
      icon: { name: 'icon-heart-mono' }, // Mono icons only
    },
  },
};
```

## Environment Detection

```typescript
export function isTossApp(): boolean {
  return /TossApp|AppsInToss/.test(navigator.userAgent);
}

export function getEnvironment(): 'toss' | 'sandbox' | 'web' {
  const ua = navigator.userAgent;
  if (/SANDBOX|sandbox/.test(ua)) return 'sandbox';
  if (/TossApp|AppsInToss/.test(ua)) return 'toss';
  return 'web';
}
```

## Review Rules Summary

Violations cause immediate rejection. See [references/review-rules.md](references/review-rules.md) for the complete list with examples.

**Critical prohibitions** (violation = rejection):
1. No `alert()`, `confirm()`, `prompt()`
2. No custom header, back button, or hamburger menu
3. No `appLogin()` on app start (show intro first)
4. No external navigation for core features
5. No app install promotion text/links
6. No static SDK imports (except TossAds)
7. No pinch zoom — set `user-scalable=no` in viewport meta

**Mandatory requirements**:
1. `navigationBar: { withBackButton: true, withHomeButton: true }`
2. App name matches exactly across granite.config.ts, `<title>`, og:title, and all surfaces
3. Korean app name (한글), 600x600px square logo
4. Handle login unlink callback → logout
5. First screen back button must exit the mini-app (not just refresh)

## Reference Guide

Read the specific reference file based on your task:

| Task | Reference |
|------|-----------|
| Need full API signatures, parameters, or event types | [references/sdk-api-catalog.md](references/sdk-api-catalog.md) |
| Checking review compliance or preparing for submission | [references/review-rules.md](references/review-rules.md) |
| Implementing hooks (auth, ads, IAP, share, banner) | [references/code-examples.md](references/code-examples.md) |
| Finding official doc URLs for deep reference | [references/official-doc-urls.md](references/official-doc-urls.md) |

## TDS Design System

Non-game mini-apps should use `@toss/tds-mobile` for Toss UX consistency.

```bash
npm install @toss/tds-mobile
```

Key components: Button, Dialog, BottomSheet, TextField, Toggle, Tabs, Toast.

Tab bar: floating style, 2-5 items, proper spacing.
