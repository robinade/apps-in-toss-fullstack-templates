---
name: appintoss-sdk-reference
description: >
  Complete AppsInToss (앱인토스) SDK reference for building Toss mini-apps.
  Covers all SDK APIs (login, ads, payments, share, storage, navigation, device),
  mandatory review rules (NEVER/ALWAYS), code patterns, and TDS design system guidance.
  Replaces the appintoss-docs MCP server with fully embedded documentation.
  Use this skill whenever implementing AppsInToss features, checking SDK APIs,
  verifying review compliance, or building any Toss mini-app.
  Triggers on: 앱인토스, AppsInToss, 토스 로그인, TDS, 미니앱, Granite, 인앱결제,
  인앱광고, 프로모션, 푸시알림, 배너광고, 리워드광고, 토스페이, SDK, 심사, 반려,
  mini-app, toss login, in-app purchase, rewarded ad, banner ad, promotion.
---

# AppsInToss SDK Reference

Complete reference for `@apps-in-toss/web-framework` 2.0.1 (Granite 1.0+ WebView).

## SDK Import Pattern (Mandatory)

Every SDK call must use dynamic import + `isSupported()` check. Static imports crash in web environments and cause review rejection.

```typescript
// CORRECT
const { someAPI } = await import('@apps-in-toss/web-framework');
if (someAPI.isSupported() !== true) { /* mock or return */ }
const cleanup = someAPI({ options, onEvent, onError });
return () => cleanup?.();

// WRONG — causes crash + review rejection
import { someAPI } from '@apps-in-toss/web-framework';
```

## API Quick Reference

### Authentication

| API | Description | Returns |
|-----|-------------|---------|
| `appLogin()` | Toss OAuth login | `{ authorizationCode, referrer }` |

Login flow: User action → `appLogin()` → send `authorizationCode` to your server → server exchanges for tokens via mTLS → server returns app JWT to client.

Never call `appLogin()` on app start. Show intro/landing first.

### Advertising (IntegratedAd v2)

| API | Description |
|-----|-------------|
| `loadFullScreenAd({ options, onEvent, onError })` | Pre-load fullscreen ad |
| `showFullScreenAd({ options, onEvent, onError })` | Display loaded ad |
| `TossAds.initialize({ callbacks })` | Initialize banner SDK |
| `TossAds.attachBanner(adGroupId, element, options?)` | Attach banner to DOM |

Load → Show order is mandatory. Reverse order causes rejection.

Show events: `requested`, `show`, `impression`, `clicked`, `dismissed`, `failedToShow`, `userEarnedReward`.

For rewarded ads, always handle `userEarnedReward` event: `event.data = { unitType, unitAmount }`.

### Payments

| API | Description |
|-----|-------------|
| `getProductItemList({ options: { productIds } })` | Fetch product info |
| `createOneTimePurchaseOrder({ options: { productId } })` | Purchase consumable |

Before payment: show product name, quantity, total, refund policy.
During payment: pause media. After: resume media.

### Share & Viral

| API | Description |
|-----|-------------|
| `getTossShareLink(deepLink, ogImageUrl?)` | Generate Toss share link |
| `share({ title, text, url })` | Native share dialog |
| `contactsViral({ options })` | Contact-based viral invite |

Always use `getTossShareLink()` — never share links to your own website.

### Storage

| API | Description |
|-----|-------------|
| `Storage.setItem(key, value)` | Save to native storage |
| `Storage.getItem(key)` | Read from native storage |

### Navigation & UI

| API | Description |
|-----|-------------|
| `NavigationBar` config in `granite.config.ts` | Set back/home buttons |
| `back-event` listener | Handle back button press |

### Device & Environment

| API | Description |
|-----|-------------|
| `getOperationalEnvironment()` | Detect: `toss` / `sandbox` / `web` |
| `permission` APIs | Request camera, location, etc. |
| `getDeviceLocale()` | Get device language/region |
| `getNetworkStatus()` | Check connectivity |
| `haptic` | Trigger haptic feedback |

### Promotion & Rewards

| API | Description |
|-----|-------------|
| `executePromotion({ options })` | Execute Toss Points reward |

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

## Environment Detection Pattern

```typescript
export function isTossApp(): boolean {
  const ua = navigator.userAgent;
  return ua.includes('TossApp') || ua.includes('AppsInToss');
}

export type AppEnvironment = 'toss' | 'sandbox' | 'web';

export function getEnvironment(): AppEnvironment {
  const ua = navigator.userAgent;
  if (ua.includes('SANDBOX') || ua.includes('sandbox')) return 'sandbox';
  if (ua.includes('TossApp') || ua.includes('AppsInToss')) return 'toss';
  return 'web';
}
```

## Review Rules Summary

Violations cause immediate rejection. See [references/review-rules.md](references/review-rules.md) for complete rules.

### Critical NEVER Rules

1. No `alert()`, `confirm()`, `prompt()`
2. No custom header/back button/hamburger menu
3. No `appLogin()` on app start (show intro first)
4. No external browser navigation for core features
5. No app install promotion text/links
6. No static SDK imports
7. No pinch zoom (must set `user-scalable=no`)

### Critical ALWAYS Rules

1. Set `navigationBar: { withBackButton: true, withHomeButton: true }`
2. Match app name exactly across granite.config.ts, `<title>`, and all surfaces
3. Use 한글 app name, 600x600px square logo
4. Handle login unlink callback → logout
5. First screen back button must exit the mini-app

## Detailed References

- **[SDK API Catalog](references/sdk-api-catalog.md)** — Complete API signatures, parameters, event types
- **[Review Rules](references/review-rules.md)** — Full NEVER/ALWAYS/CONDITIONAL rules with examples
- **[Code Examples](references/code-examples.md)** — Production-ready hook implementations
- **[Official Doc URLs](references/official-doc-urls.md)** — All official documentation links for deep reference

## TDS Design System

Non-game mini-apps should use `@toss/tds-mobile` for Toss UX consistency.

```bash
npm install @toss/tds-mobile
```

Key components: Button, Dialog, BottomSheet, TextField, Toggle, Tabs, Toast.

Tab bar rules: floating style, 2-5 items, proper spacing.
