# AppsInToss SDK & Review Compliance Rules

## Mandatory Doc Sources

| Priority | URL | When |
|----------|-----|------|
| 1 | `https://developers-apps-in-toss.toss.im/llms.txt` | **Always** — read first to find relevant doc pages |
| 2 | `https://developers-apps-in-toss.toss.im/llms-full.txt` | When llms.txt lacks detail |
| 3 | `https://developers-apps-in-toss.toss.im/tutorials/examples.md` | When implementing — get example code |
| 4 | `https://tossmini-docs.toss.im/tds-mobile/llms-full.txt` | When using TDS components (required for non-game) |

## SDK Workflow

1. `ref_read_url` → read `llms.txt` to locate the relevant doc page(s)
2. `ref_read_url` → read the specific page(s) found in step 1
3. `ref_read_url` → read `examples.md` if implementation code is needed
4. Then proceed with normal workflow (`Exa` → `Context7` → execute)

## SDK Rules

- **Never implement AppsInToss SDK APIs from memory.** Always verify against official docs.
- **TDS is mandatory** for non-game mini-apps. Always check TDS docs when building UI.
- AppsInToss uses **Granite framework** (>= 1.0). Use `@toss/tds-mobile` for web, `@toss/tds-react-native` for native.
- SDK Import: always use dynamic import + `isSupported()` check, never static import.

```typescript
// ✅ CORRECT
const { someAPI } = await import('@apps-in-toss/web-framework');
if (someAPI.isSupported() !== true) { /* mock */ return; }

// ❌ WRONG
import { someAPI } from '@apps-in-toss/web-framework';
```

## Auto-Trigger Keywords

These keywords activate AppsInToss rules automatically:
앱인토스, AppsInToss, 토스로그인, TDS, 미니앱, Granite, Bedrock, 인앱결제, 인앱광고, 프로모션, 푸시알림, 배너광고, 리워드광고

---

## Review Compliance (Violation = Rejection)

### NEVER

**UI:**
- No `alert()`/`confirm()`/`prompt()` → use custom modal
- No custom back button, top header, hamburger menu → common nav bar only
- No pinch zoom → `user-scalable=no` in viewport meta
- Nav accessory: monochrome icon only, max 1
- No unintended horizontal scroll on home screen
- No full-screen bottom sheets blocking close button

**Auth:**
- No `appLogin()` on app start → show intro/landing screen first
- No custom terms-of-service UI → use Toss login flow
- No Toss OAuth tokens on client → server-only, issue own JWT

**External Links:**
- No external app/browser navigation for core features → complete within mini-app
- No app install promotion (text, banner, market link, benefit notice)
- No external payment pages → use in-app purchase or TossPay
- No share links to own website → use `getTossShareLink()`
- Allowed: legal notices, government/partner official pages, third-party info

**Text:**
- No subscription-misleading wording when not actual subscription
- UI amount must match actual charge exactly

### ALWAYS

**Navigation Bar:**
- `navigationBar: { withBackButton: true, withHomeButton: true }` in granite.config.ts
- First screen back button must exit the app (not just refresh)
- App icon/logo must display in common nav bar

**Branding:**
- App name identical across: `brand.displayName`, `<title>`, `<meta og:title>`, console, share messages
- Korean app name preferred (토스 O, Toss X)
- `brand.primaryColor` as `#RRGGBB` (e.g., `#3182F6`)
- Logo: 600x600px square, visible on both light/dark backgrounds

**Login (when implemented):**
- Handle unlink callback → logout + re-login flow
- Register callback URLs in console (UNLINK, WITHDRAWAL_TERMS, WITHDRAWAL_TOSS)

**Permissions (when using camera/location):**
- Use Toss permission bottom sheet
- Only list actually-used permissions
- Provide re-request guidance on denial

**Routing:**
- All registered scheme URLs must return valid pages (no 404)

**Ads (when implemented):**
- `loadFullScreenAd()` → `showFullScreenAd()` order mandatory
- Handle `userEarnedReward` for rewarded ads

**Payment (when implemented):**
- Show product name/qty/amount before charge
- Pause media during payment, resume after

**Share (when implemented):**
- Use `getTossShareLink()` + `share` API

**Viewport (required in index.html):**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```
