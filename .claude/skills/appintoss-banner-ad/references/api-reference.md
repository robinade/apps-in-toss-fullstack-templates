# TossAds Banner Ad v2 — API Reference

Complete TypeScript types and API signatures for the AppsInToss Banner Ad SDK.

> **SDK Version Note (2026-03)**
> `TossAds.attachBanner` requires `@apps-in-toss/web-framework` >= **1.11.0**.
> Older versions (< 1.11.0) only have `TossAds.attach` (deprecated).
> Always ensure the project uses >= 1.11.0 before generating code.

## Contents
- TossAds.initialize
- TossAds.attachBanner
- TossAds.destroyAll
- Type Definitions
- Event Payload Types
- Error Payload Types

---

## TossAds.initialize

Initialize the banner ad SDK. Call once at app startup.

```typescript
TossAds.initialize(options: TossAdsInitializeOptions): void;
TossAds.initialize.isSupported(): boolean;
```

### TossAdsInitializeOptions

```typescript
interface TossAdsInitializeOptions {
  callbacks?: {
    /** SDK initialization succeeded */
    onInitialized?: () => void;
    /** SDK initialization failed */
    onInitializationFailed?: (error: Error) => void;
  };
}
```

---

## TossAds.attachBanner

Attach a banner ad to a DOM element. Returns an object with `destroy()`.

> **Version requirement:** `@apps-in-toss/web-framework` >= 1.11.0.
> If your project uses < 1.11.0, the SDK only exposes `TossAds.attach()` (deprecated legacy API).
> Always check and upgrade the SDK version first.

```typescript
TossAds.attachBanner(
  adGroupId: string,
  target: string | HTMLElement,
  options?: TossAdsAttachBannerOptions
): TossAdsAttachBannerResult;

TossAds.attachBanner.isSupported(): boolean;
```

### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `adGroupId` | `string` | Ad group ID from AppsInToss console |
| `target` | `string \| HTMLElement` | DOM element or CSS selector |
| `options` | `TossAdsAttachBannerOptions` | Style and callback options |

### TossAdsAttachBannerOptions

```typescript
interface TossAdsAttachBannerOptions {
  /** Theme: auto follows system dark mode. Default: 'auto' */
  theme?: 'auto' | 'light' | 'dark';
  /** Background tone. Default: 'blackAndWhite' */
  tone?: 'blackAndWhite' | 'grey';
  /** Banner shape. 'card' adds padding + border-radius. Default: 'expanded' */
  variant?: 'card' | 'expanded';
  /** Ad lifecycle event callbacks */
  callbacks?: TossAdsBannerSlotCallbacks;
}
```

### TossAdsAttachBannerResult

```typescript
interface TossAdsAttachBannerResult {
  /** Remove the attached banner. Call on unmount to prevent memory leaks. */
  destroy: () => void;
}
```

---

## TossAds.destroyAll

Remove all initialized banner slots at once.

```typescript
TossAds.destroyAll(): void;
TossAds.destroyAll.isSupported(): boolean;
```

---

## Callback Types

### TossAdsBannerSlotCallbacks

```typescript
interface TossAdsBannerSlotCallbacks {
  /** Ad rendering complete */
  onAdRendered?: (payload: TossAdsBannerSlotEventPayload) => void;
  /** Ad visible on screen */
  onAdViewable?: (payload: TossAdsBannerSlotEventPayload) => void;
  /** Ad impression recorded (revenue generated) */
  onAdImpression?: (payload: TossAdsBannerSlotEventPayload) => void;
  /** User clicked the ad */
  onAdClicked?: (payload: TossAdsBannerSlotEventPayload) => void;
  /** No ad available to display */
  onNoFill?: (payload: { slotId: string; adGroupId: string; adMetadata: {} }) => void;
  /** Ad failed to render */
  onAdFailedToRender?: (payload: TossAdsBannerSlotErrorPayload) => void;
}
```

### TossAdsBannerSlotEventPayload

```typescript
interface TossAdsBannerSlotEventPayload {
  /** Generated slot ID */
  slotId: string;
  /** Ad group ID */
  adGroupId: string;
  /** Ad metadata */
  adMetadata: {
    creativeId: string;
    requestId: string;
  };
}
```

### TossAdsBannerSlotErrorPayload

```typescript
interface TossAdsBannerSlotErrorPayload {
  slotId: string;
  adGroupId: string;
  adMetadata: {};
  error: {
    code: number;
    message: string;
    domain?: string;
  };
}
```

---

## Test Ad Group IDs

| Type | ID | Description |
|------|----|-------------|
| List banner | `ait-ad-test-banner-id` | Standard list-style banner |
| Feed banner | `ait-ad-test-native-image-id` | Image-focused feed-style banner |

Production IDs follow the pattern `ait.v2.live.<hash>` and are issued from the AppsInToss console.

---

## SDK Package by Platform

| Platform | Package | Import |
|----------|---------|--------|
| WebView | `@apps-in-toss/web-framework` | `import { TossAds } from '@apps-in-toss/web-framework'` |
| React Native | `@apps-in-toss/framework` | `import { TossAds } from '@apps-in-toss/framework'` |

Framework version matters for TDS package selection:
- `@apps-in-toss/web-framework` < 1.0.0 → `@toss-design-system/mobile`
- `@apps-in-toss/web-framework` >= 1.0.0 → `@toss/tds-mobile`

---

## Event Flow

```
initialize() → onInitialized
                    ↓
             attachBanner()
                    ↓
             onAdRendered     (ad HTML injected)
                    ↓
             onAdViewable     (ad visible in viewport)
                    ↓
             onAdImpression   (impression counted, revenue event)
                    ↓
             onAdClicked      (optional, user interaction)

Auto-refresh triggers:
  - 10+ seconds after render
  - Visibility change: hidden → visible (background → foreground)
```

---

## Version Requirements

| Toss App Version | Support |
|------------------|---------|
| 5.241.0+ | Full banner ad support |
| < 5.241.0 | Not supported — blank screen without handling |

| SDK Version | API Available |
|-------------|--------------|
| >= 1.11.0 | `TossAds.attachBanner()` (recommended) |
| < 1.11.0 | `TossAds.attach()` only (deprecated) |

Use `getTossAppVersion()` from the framework SDK to gate features:

```typescript
import { getTossAppVersion } from '@apps-in-toss/web-framework';

const version = getTossAppVersion();
// Compare version string to determine support
```

---

## Container Guidelines

- `width` must be `100%` (screen width). Never use fixed pixel widths.
- Fixed mode: `height: 96px` recommended.
- Inline mode: omit height — SDK auto-sizes based on ad content.
- The target element must be empty (no child nodes).
- Do not apply `overflow: hidden` — the SDK manages clipping internally.

---

## Legacy API Mapping (< 1.11.0 → >= 1.11.0)

| Legacy (< 1.11.0) | Current (>= 1.11.0) | Notes |
|--------------------|----------------------|-------|
| `TossAds.attach()` | `TossAds.attachBanner()` | Renamed, same functionality |
| `AttachOptions` | `TossAdsAttachBannerOptions` | Re-exported as alias |
| `InitializeOptions` | `TossAdsInitializeOptions` | Re-exported as alias |
