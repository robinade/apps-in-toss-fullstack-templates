---
name: appintoss-cross-promo
description: Implements cross-promotion bottom sheets between Apps-in-Toss mini-apps. Creates TDS-styled promotional banners that navigate users to other mini-apps using the SDK openURL API. Use when adding cross-app promotion, linking between mini-apps, implementing "try our other apps" features, or when the user mentions cross-promotion, app switching, promotional banners between apps, or wants to drive traffic between their Toss mini-apps.
---

# Apps-in-Toss Cross-Promotion Bottom Sheet

Implement promotional bottom sheets that let users navigate between mini-apps within the Toss ecosystem.

## Quick Start

Two things to get right:
1. **Navigation**: Use SDK `openURL`, never `window.location.href`
2. **UI**: Use vaul Drawer (or TDS BottomSheet if installed) with TDS color tokens

## Navigation API

The only correct way to navigate between mini-apps:

```tsx
const handleNavigate = async (scheme: string) => {
  try {
    const { openURL } = await import('@apps-in-toss/web-framework');
    openURL(scheme);
  } catch {
    // Web dev environment fallback
    window.location.href = scheme;
  }
};
```

**Why not `window.location.href`?** The WebView treats it as an HTTP request, routing through CloudFront and causing 503 errors. The SDK's `openURL` passes the scheme to the native Toss layer, which handles mini-app switching correctly.

### Scheme Format

```
intoss://{appName}/           — App home
intoss://{appName}/{path}     — Deep link to specific page
intoss://{appName}?key=value  — With query parameters
```

Find the correct appName in the Apps-in-Toss developer console under each app's settings.

## Component Template

See [references/component-template.tsx](references/component-template.tsx) for the full implementation.

Key structure:
- **Drawer** (vaul): `shouldScaleBackground={false}`
- **Promo card**: 40x40 icon + title (15px semibold) + subtitle (13px) + chevron
- **Data-driven**: `PROMO_ITEMS` array for easy addition of new apps

## UX Placement Guide

Choose when to show the bottom sheet based on the user's emotional state:

| Moment | Trigger | Why It Works |
|--------|---------|-------------|
| After reward claim | `rewardClaimed === true` + 1.2s delay | Achievement high + "want more" momentum |
| Post-game completion | Game result shown | Success state, open to next action |
| Daily task complete | All daily tasks done | Routine completion, looking for what's next |
| Idle/waiting state | Countdown timer visible | Nothing to do, receptive to suggestions |

**Anti-patterns to avoid:**
- Don't show during active gameplay or mid-flow
- Don't show before the user claims rewards (competes for attention)
- Don't show on every app open (fatigue)
- Don't block core functionality

### Implementation Pattern

```tsx
// Show once per session, after key action, with delay
const [showPromo, setShowPromo] = useState(false);

useEffect(() => {
  if (!triggerCondition) return;
  const timer = setTimeout(() => setShowPromo(true), 1200);
  return () => clearTimeout(timer);
}, [triggerCondition]);
```

## TDS Design Tokens

Apply these tokens regardless of whether `@toss/tds-mobile` is installed:

| Element | Token | Value |
|---------|-------|-------|
| Section title | Typography 5, bold | 17px, `#191f28` |
| Card title | Typography 6, semibold | 15px, `#191f28` |
| Card subtitle | Typography 7 | 13px, `#9ca3af` |
| Chevron | — | 20px, `#9ca3af` |
| Icon container | — | 40x40, rounded-xl |
| Card border | grey200 | `#e5e7eb` |
| Card radius | — | 12px |
| Sheet radius | — | 16px top corners |
| Blue bg (weather etc) | blue50 | `#e8f3ff` |
| Green bg (health etc) | green50 | `#e8f8ef` |
| Orange bg (finance etc) | orange50 | `#fff3e0` |
| Primary action | blue500 | `#3182f6` |

## Adding a New App

Add an entry to the `PROMO_ITEMS` array:

```tsx
{
  emoji: '🎮',           // or use an <img> for app icon
  bgColor: '#e8f3ff',    // pick from TDS color tokens above
  title: '게임하고 포인트 받기',
  subtitle: 'Play Games',
  scheme: 'intoss://my-game-app/',
}
```

## Checklist

- [ ] Uses `openURL` from SDK (dynamic import + try/catch)
- [ ] Bottom sheet, not inline content (screens are full)
- [ ] Shows after key user action, not on load
- [ ] 1-1.5s delay before showing
- [ ] Dismissible (swipe down / tap overlay)
- [ ] Only shows once per session
- [ ] TDS color tokens (no hardcoded random colors)
- [ ] Korean copy in 해요체
- [ ] Tested on real Toss app (not just dev browser)
