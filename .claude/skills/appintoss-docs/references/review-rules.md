# AppsInToss Review Rules

Complete NEVER/ALWAYS/CONDITIONAL rules for non-game mini-app review.
Violating any NEVER rule results in immediate rejection.

## Contents

- NEVER Rules (N1-N10) — violation = rejection
- ALWAYS Rules (A1-A11) — mandatory requirements
- CONDITIONAL Rules (C1-C5) — when specific features are used

## NEVER Rules (Violation = Rejection)

### N1: No Browser Dialogs

`alert()`, `confirm()`, `prompt()` are forbidden.

Use: TDS Dialog, shadcn-ui AlertDialog, or custom modal.

### N2: No Custom Header/Navigation

No `<header>`, `<Header>`, `<AppBar>`, `<TopBar>`, `<Navbar>`, custom back buttons, `goBack()`, `navigate(-1)`, `history.back()`, hamburger menus.

The common NavigationBar (configured in granite.config.ts) is the only allowed top UI. Custom headers make the app look like an in-app browser, causing rejection.

### N3: No Login on App Start

No `appLogin()` in `useEffect` on `App.tsx` or `main.tsx`.

Show intro/landing screen first. Login only after user action.

```typescript
// WRONG
function App() {
  useEffect(() => { appLogin(); }, []);
}

// CORRECT
function App() {
  return showIntro ? <IntroView onStart={handleLogin} /> : <MainView />;
}
```

### N4: No External Navigation

No `window.open()`, `location.href = ...`, `window.location = ...` for core features.

Exceptions: legal notices, public institution links, third-party info pages.

### N5: No App Install Promotion

No text, banners, or links encouraging app installation:
- "앱을 설치하시면..."
- "앱 다운로드하고 할인 받으세요"
- play.google.com, apps.apple.com links
- App store badges

### N6: No Static SDK Imports

```typescript
// WRONG — crashes in web, rejected in review
import { someAPI } from '@apps-in-toss/web-framework';

// CORRECT
const { someAPI } = await import('@apps-in-toss/web-framework');
```

### N7: No Pinch Zoom

Must include in index.html:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### N8: No Subscription-Misleading Text

Never use "구독", "정기결제" if the feature is not an actual subscription.

### N9: No Mismatched Payment Amounts

UI-displayed price must exactly match the actual charge amount.

### N10: Navigation Accessory Rules

- Mono-tone icons only (no colored icons)
- Maximum 1 accessory button
- No full-screen bottom sheets blocking close button

---

## ALWAYS Rules (Mandatory)

### A1: NavigationBar Configuration

```typescript
// granite.config.ts
navigationBar: {
  withBackButton: true,   // Required
  withHomeButton: true,    // Required
}
```

### A2: First Screen Exit Behavior

Back button on the first screen (onboarding/landing) must exit the mini-app.
If it only refreshes the page, the app will be rejected.

### A3: App Icon in NavigationBar

Display your app icon/logo in the common navigation bar.

### A4: Brand Name Consistency

The app name must match exactly (including spaces) across ALL locations:
- `granite.config.ts` → `brand.displayName`
- `index.html` → `<title>`
- `index.html` → `<meta property="og:title">`
- Share messages, meta tags, all in-app displays
- Console registration

### A5: Brand Requirements

- Korean app name (한글) — "토스" not "Toss"
- `brand.primaryColor` as 6-digit hex with `#` (e.g., `#3182F6`)
- 600x600px square logo, visible on both light/dark backgrounds

### A6: Login Unlink Handling

When users unlink their Toss login:
- Handle unlink callback → perform logout
- Implement re-login flow
- Register callback URLs in console for: UNLINK, WITHDRAWAL_TERMS, WITHDRAWAL_TOSS

### A7: Token Security

- Toss OAuth tokens (AccessToken, RefreshToken) → server-side only
- Issue your app's own JWT to the client
- Never expose Toss tokens to client code

### A8: Permission Bottom Sheet

When requesting camera/location/etc.:
- Use Toss permission bottom sheet
- Show only permissions you'll actually request
- Provide re-request guidance if denied

### A9: Scheme URL Validity

All registered feature scheme URLs must return valid pages (no 404s).
Verify landing pages render correctly.

### A10: UI Completeness

- Reflect data immediately after user actions (likes, favorites)
- Show guidance when limited-use features are exhausted
- All feature buttons must work correctly
- Avoid excessive blinking/animation

### A11: Intro Screen

Must have an intro/onboarding/landing/welcome screen component.

---

## CONDITIONAL Rules (When Feature Is Used)

### C1: Advertising

When using `loadFullScreenAd`/`showFullScreenAd`:
- Load → Show order (never reverse)
- Handle `userEarnedReward` event for rewarded ads
- Verify ad loading works correctly

When using banner ads:
- `TossAds.initialize()` → `TossAds.attachBanner()` order

### C2: Payments

When using IAP or TossPay:
- Show product name, quantity, total, discount, refund policy before payment
- Pause in-app media (music, video) during payment
- Resume media after payment completes
- IAP: distinguish consumable vs non-consumable items correctly
- TossPay: use AppsInToss-specific merchant key (existing keys won't work)
- TossPay: order numbers must be unique

### C3: Share

When using share features:
- Must use `getTossShareLink()` for link generation
- Never share links pointing to your own website

### C4: TDS Design System

Not a direct rejection cause, but strongly recommended for non-game apps.
Tab bar: floating style, 2-5 items, proper spacing/sizing.

### C5: External Links (Allowed)

These external links are permitted:
- Legal notices
- Public institution / government pages
- Third-party partner info pages
- NOT for core app functionality
