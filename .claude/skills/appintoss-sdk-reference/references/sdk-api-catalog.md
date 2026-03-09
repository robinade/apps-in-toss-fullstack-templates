# AppsInToss SDK API Catalog

Complete API signatures for `@apps-in-toss/web-framework` 2.0.1.

## Contents

- Authentication (appLogin)
- Advertising (fullscreen, banner)
- Payments (IAP, TossPay)
- Share & Viral
- Storage
- Navigation & UI
- Device & Environment
- Promotion & Rewards
- Analytics

---

## Authentication

### appLogin

```typescript
const { appLogin } = await import('@apps-in-toss/web-framework');

const result = await appLogin();
// result: { authorizationCode: string; referrer: 'DEFAULT' | 'SANDBOX' }
```

Server-side token exchange (mTLS required):
1. Client sends `authorizationCode` to your server
2. Server calls Toss OAuth token endpoint with mTLS cert
3. Server receives `accessToken` + `refreshToken` (never expose to client)
4. Server issues your app's own JWT to client

Unlink callback: register callback URLs in console for `UNLINK`, `WITHDRAWAL_TERMS`, `WITHDRAWAL_TOSS`.

---

## Advertising

### loadFullScreenAd

Pre-loads a fullscreen ad (interstitial or rewarded).

```typescript
interface LoadFullScreenAdParams {
  options: { adGroupId: string };
  onEvent: (event: { type: 'loaded' }) => void;
  onError: (error: unknown) => void;
}

const { loadFullScreenAd } = await import('@apps-in-toss/web-framework');
if (loadFullScreenAd.isSupported() !== true) return;

const cleanup = loadFullScreenAd({
  options: { adGroupId: 'YOUR_AD_GROUP_ID' },
  onEvent: (event) => {
    if (event.type === 'loaded') { /* ad is ready to show */ }
  },
  onError: (error) => { /* handle load failure */ },
});

// Call cleanup() to cancel loading
```

### showFullScreenAd

Displays a previously loaded fullscreen ad. Must call `loadFullScreenAd` first.

```typescript
type ShowFullScreenAdEvent =
  | { type: 'requested' }
  | { type: 'show' }
  | { type: 'impression' }
  | { type: 'clicked' }
  | { type: 'dismissed' }
  | { type: 'failedToShow' }
  | { type: 'userEarnedReward'; data: { unitType: string; unitAmount: number } };

interface ShowFullScreenAdParams {
  options: { adGroupId: string };
  onEvent: (event: ShowFullScreenAdEvent) => void;
  onError: (error: unknown) => void;
}

const { showFullScreenAd } = await import('@apps-in-toss/web-framework');
if (showFullScreenAd.isSupported() !== true) return;

const cleanup = showFullScreenAd({
  options: { adGroupId: 'YOUR_AD_GROUP_ID' },
  onEvent: (event) => {
    switch (event.type) {
      case 'userEarnedReward':
        // Grant reward: event.data.unitType, event.data.unitAmount
        break;
      case 'dismissed':
        // Reload next ad
        break;
      case 'failedToShow':
        // Handle failure, reload
        break;
    }
  },
  onError: (error) => { /* handle error */ },
});
```

### TossAds (Banner v2)

```typescript
import { TossAds, type TossAdsAttachBannerOptions } from '@apps-in-toss/web-framework';

// Step 1: Initialize (once per app lifecycle)
if (TossAds.initialize.isSupported()) {
  TossAds.initialize({
    callbacks: {
      onInitialized: () => { /* ready */ },
      onInitializationFailed: (error) => { /* handle */ },
    },
  });
}

// Step 2: Attach banner to DOM element
const cleanup = TossAds.attachBanner(adGroupId, domElement, options?);
// Call cleanup() to remove banner
```

Note: Banner ads use static import (exception to dynamic import rule) because TossAds is a namespace object.

---

## Payments

### getProductItemList

```typescript
interface ProductItem {
  productId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
}

const { getProductItemList } = await import('@apps-in-toss/web-framework');
if (getProductItemList.isSupported() !== true) return;

const result = await getProductItemList({
  options: { productIds: ['gem_100', 'gem_500'] },
});
// result.productItems: ProductItem[]
```

### createOneTimePurchaseOrder

```typescript
const { createOneTimePurchaseOrder } = await import('@apps-in-toss/web-framework');
if (createOneTimePurchaseOrder.isSupported() !== true) return;

const result = await createOneTimePurchaseOrder({
  options: { productId: 'gem_100' },
});
// result: { orderId, productId, purchaseTime }
```

### TossPay

Use AppsInToss-specific merchant key (existing keys won't work).
Order numbers must be unique per transaction.

---

## Share & Viral

### getTossShareLink

```typescript
const { getTossShareLink } = await import('@apps-in-toss/web-framework');

const shareUrl = await getTossShareLink(
  'intoss://my-app/invite?code=ABC',  // deep link
  'https://example.com/og-image.png'   // optional OG image
);
```

### share

```typescript
const { share } = await import('@apps-in-toss/web-framework');
if (share.isSupported() !== true) return;

await share({
  title: '친구에게 공유',
  text: '이 앱을 확인해보세요!',
  url: shareUrl,  // from getTossShareLink
});
```

### contactsViral

```typescript
const { contactsViral } = await import('@apps-in-toss/web-framework');
if (contactsViral.isSupported() !== true) return;

const cleanup = contactsViral({
  options: { /* viral config */ },
  onEvent: (event) => { /* handle invite results */ },
  onError: (error) => { /* handle error */ },
});
```

---

## Storage

```typescript
const { Storage } = await import('@apps-in-toss/web-framework');

// Save
await Storage.setItem('key', 'value');

// Read
const value = await Storage.getItem('key');

// Remove
await Storage.removeItem('key');
```

---

## Navigation & UI

### NavigationBar

Configured in `granite.config.ts`, not in code. See main SKILL.md for template.

### Back Event

```typescript
const { addEventListener } = await import('@apps-in-toss/web-framework');
if (addEventListener.isSupported() !== true) return;

const cleanup = addEventListener('backButtonPressed', () => {
  // Handle back button press
  // On first screen: should exit the mini-app (don't just refresh)
});

return () => cleanup();
```

---

## Device & Environment

### getOperationalEnvironment

```typescript
const { getOperationalEnvironment } = await import('@apps-in-toss/web-framework');

const env = getOperationalEnvironment();
// 'toss' | 'sandbox' | 'web'
```

### Permission

```typescript
const { requestPermission } = await import('@apps-in-toss/web-framework');
if (requestPermission.isSupported() !== true) return;

const result = await requestPermission({
  options: { permission: 'camera' },  // 'camera' | 'location' | 'photos' | etc.
});
```

Show Toss permission bottom sheet. Only request permissions you'll actually use.

### Camera

```typescript
const { openCamera } = await import('@apps-in-toss/web-framework');
if (openCamera.isSupported() !== true) return;

const result = await openCamera({ options: { maxCount: 1 } });
// result.photos: Array<{ uri: string; width: number; height: number }>
```

### Album Photos

```typescript
const { openAlbum } = await import('@apps-in-toss/web-framework');
if (openAlbum.isSupported() !== true) return;

const result = await openAlbum({ options: { maxCount: 5 } });
// result.photos: Array<{ uri: string; width: number; height: number }>
```

### Location

```typescript
const { getCurrentPosition } = await import('@apps-in-toss/web-framework');
if (getCurrentPosition.isSupported() !== true) return;

const position = await getCurrentPosition();
// position: { latitude: number; longitude: number; accuracy: number }
```

### Haptic Feedback

```typescript
const { haptic } = await import('@apps-in-toss/web-framework');
if (haptic.isSupported() !== true) return;

haptic({ type: 'impact' }); // 'impact' | 'notification' | 'selection'
```

### Locale

```typescript
const { getDeviceLocale } = await import('@apps-in-toss/web-framework');

const locale = await getDeviceLocale();
// locale: { language: string; region: string }
```

### Network

```typescript
const { getNetworkStatus } = await import('@apps-in-toss/web-framework');
if (getNetworkStatus.isSupported() !== true) return;

const status = await getNetworkStatus();
// status: { isConnected: boolean; type: 'wifi' | 'cellular' | 'none' }
```

### Clipboard

```typescript
const { setClipboardText } = await import('@apps-in-toss/web-framework');
if (setClipboardText.isSupported() !== true) return;

await setClipboardText({ text: 'copied text' });
```

### Push Notification

```typescript
const { requestPushPermission } = await import('@apps-in-toss/web-framework');
if (requestPushPermission.isSupported() !== true) return;

const result = await requestPushPermission();
// result: { granted: boolean; token?: string }
```

---

## Promotion & Rewards

### executePromotion

Grants Toss Points rewards (server-side mTLS required).

```typescript
// Client-side: trigger promotion via your server
const response = await fetch('/api/promotion/reward', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, promotionId, amount }),
});
```

Server calls `executePromotion` API with mTLS certificate.

---

## Analytics

```typescript
const { sendAnalytics } = await import('@apps-in-toss/web-framework');

sendAnalytics({
  eventName: 'button_click',
  data: { buttonId: 'start', screen: 'home' },
});
```
