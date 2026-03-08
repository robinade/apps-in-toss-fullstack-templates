# TDS Mobile Color System

## Color Token Architecture

11 color families, each with 10 tonal variations (50-900). Access via `@toss/tds-colors`.

```typescript
import { colors } from '@toss/tds-colors';
```

## Grey Scale

| Token | Hex |
|-------|-----|
| grey50 | #f9fafb |
| grey100 | #f3f4f6 |
| grey200 | #e5e7eb |
| grey300 | #d1d5db |
| grey400 | #9ca3af |
| grey500 | #6b7280 |
| grey600 | #4b5563 |
| grey700 | #374151 |
| grey800 | #1f2937 |
| grey900 | #191f28 |

## Blue (Primary Brand)

| Token | Hex | Role |
|-------|-----|------|
| blue50 | #e8f3ff | Light background |
| blue100 | #d1e7ff | |
| blue200 | #a3d0ff | |
| blue300 | #74b8ff | |
| blue400 | #4596f5 | |
| blue500 | #3182f6 | **Brand Primary** |
| blue600 | #2573e8 | Hover |
| blue700 | #1d5fd4 | Active/Pressed |
| blue800 | #1649b8 | |
| blue900 | #194aa6 | |

## Red (Error/Critical)

| Token | Hex |
|-------|-----|
| red50 | #ffeeee |
| red100 | #ffdbdb |
| red200 | #ffb3b3 |
| red300 | #ff8a8a |
| red400 | #ff6161 |
| red500 | #ff3333 |
| red600 | #e63333 |
| red700 | #cc2929 |
| red800 | #b2191b |
| red900 | #a51926 |

## Orange (Warnings/Accent)

Range: #fff3e0 (50) to #e45600 (900)

## Yellow (Highlights)

Range: #fff9e7 (50) to #dd7d02 (900)

## Green (Success)

Range: #f0faf6 (50) to #027648 (900)

## Teal (Secondary)

Range: #edf8f8 (50) to #076565 (900)

## Purple (Accent)

Range: #f9f0fc (50) to #65237b (900)

## Grey Opacity (Overlays)

| Token | Opacity | Use Case |
|-------|---------|----------|
| greyOpacity50 | 0.02 | Subtle hover |
| greyOpacity100 | 0.05 | Light overlay |
| greyOpacity200 | 0.10 | Disabled bg |
| greyOpacity300 | 0.15 | Border overlay |
| greyOpacity400 | 0.25 | Light scrim |
| greyOpacity500 | 0.50 | Medium scrim |
| greyOpacity600 | 0.65 | Dark scrim |
| greyOpacity700 | 0.75 | Modal overlay |
| greyOpacity800 | 0.85 | Heavy overlay |
| greyOpacity900 | 0.91 | Near-opaque |

Base color: #001733 to #020913

## Semantic Background Tokens

| Token | Value | Purpose |
|-------|-------|---------|
| background | #FFFFFF | Primary surface |
| greyBackground | grey100 | Subtle container, secondary surface |
| layeredBackground | #FFFFFF | Elevated surfaces, cards |
| floatedBackground | #FFFFFF | Floating elements, popovers |

## Color Usage Rules

1. **Blue500** for primary CTAs, links, interactive elements
2. **Red500+** for errors, destructive actions, alerts
3. **Green** for success, positive confirmations
4. **Grey scale** for text hierarchy: grey900 (primary), grey600 (secondary), grey400 (tertiary/disabled)
5. **greyOpacity700** for modal/bottom-sheet scrim overlays
6. Never hardcode hex values - always use color tokens
7. Semantic background tokens enable light/dark mode switching
