---
name: appintoss-tds-mobile
description: >
  Toss Design System (TDS) Mobile compliance guide for building UI that follows Toss design standards.
  Ensures all components, colors, typography, spacing, and patterns conform to TDS 2.0 specifications.
  Use when: (1) Building or designing any UI for AppsInToss mini-apps (REQUIRED for non-game apps),
  (2) Creating React components that must follow Toss design language,
  (3) Implementing mobile-first UI with TDS components (@toss/tds-mobile),
  (4) Reviewing existing UI for TDS compliance,
  (5) Converting custom UI to use TDS tokens and components,
  (6) Any mention of TDS, Toss Design System, tds-mobile, or AppsInToss UI work.
  Triggers: TDS, toss design, tds-mobile, toss components, AppsInToss UI, mini-app design,
  toss color, toss typography, toss button, bottom sheet, toast, dialog.
---

# TDS Mobile Compliance Guide

Build any UI that fully conforms to Toss Design System (TDS) Mobile 2.0.

## Quick Reference

- **Package**: `@toss/tds-mobile` + `@toss/tds-mobile-ait` + `@emotion/react@^11`
- **Colors**: `@toss/tds-colors` - See [colors.md](references/colors.md)
- **Typography**: 7 primary levels (30px-13px) - See [typography.md](references/typography.md)
- **Components**: 40+ components - See [components.md](references/components.md)
- **Provider**: Wrap app root with `<TDSMobileAITProvider>`
- **Docs**: https://tossmini-docs.toss.im/tds-mobile/

## Decision Tree

```
Building UI for AppsInToss?
├── Non-game app → TDS is MANDATORY
│   ├── New component needed?
│   │   ├── TDS has it → Use TDS component directly
│   │   └── TDS doesn't have it → Build custom using TDS tokens only
│   └── Existing UI to update?
│       └── Replace custom styles with TDS tokens + components
└── Game app → TDS is optional (but recommended for non-game UI portions)
```

## Core Rules

1. **Always use TDS components** over custom implementations when available
2. **Always use TDS color tokens** - never hardcode hex values
3. **Always use TDS typography scale** - never arbitrary font sizes
4. **Always wrap with TDSMobileAITProvider** at app root
5. **Always support accessibility scaling** - avoid fixed px dimensions for text
6. **Primary brand color is blue500** (#3182f6) for CTAs and interactive elements
7. **Line height ratio**: consistently 1.5x of font size
8. **Minimum text size**: 13px (Typography 7) for readable content

## Setup

```tsx
// 1. Install
// npm install @toss/tds-mobile @toss/tds-mobile-ait @emotion/react@^11

// 2. Provider (app root)
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';

function App({ children }) {
  return <TDSMobileAITProvider>{children}</TDSMobileAITProvider>;
}

// 3. Use components
import { Button, ListRow, Toast } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
```

## Component Selection Guide

| Need | TDS Component | Key Props |
|------|--------------|-----------|
| Primary action | `Button` | color="primary" variant="fill" size="xlarge" |
| Secondary action | `Button` | color="primary" variant="weak" |
| Destructive action | `Button` | color="danger" |
| Text input | `TextField` | label, placeholder, error |
| Multi-line input | `TextArea` | label, maxLength |
| Search | `SearchField` | placeholder, onSearch |
| Toggle | `Switch` | checked, onChange |
| Multi-select | `Checkbox` | checked, onChange |
| List item | `ListRow` | title, description, right |
| Grid items | `GridList` | columns, items |
| Tab navigation | `Tab` | items, selected |
| Segment toggle | `SegmentedControl` | items, selected |
| Alert message | `AlertDialog` via useDialog | title, description |
| Confirmation | `ConfirmDialog` via useDialog | title, confirmButton, cancelButton |
| Notification | `Toast` via useToast | message |
| Panel/drawer | `BottomSheet` via useBottomSheet | content, title |
| Loading | `Loader` | - |
| Placeholder | `Skeleton` | width, height |
| Progress | `ProgressBar` | value, max |
| Steps | `ProgressStepper` | steps, current |
| Rating | `Rating` | value, max |
| Stepper | `Stepper` | value, min, max |
| Chart | `BarChart` | data |
| Terms | `Agreement` | items |

## Color Usage Patterns

```tsx
import { colors } from '@toss/tds-colors';

// Text hierarchy
const primaryText = colors.grey900;    // Main text
const secondaryText = colors.grey600;  // Supporting text
const tertiaryText = colors.grey400;   // Disabled/placeholder

// Interactive states
const primaryAction = colors.blue500;  // CTA, links
const hoverAction = colors.blue600;    // Hover
const activeAction = colors.blue700;   // Pressed

// Feedback
const errorColor = colors.red500;      // Errors
const successColor = colors.green500;  // Success

// Backgrounds
const surface = colors.background;           // Primary surface (#FFF)
const subtleBg = colors.greyBackground;      // Secondary surface (grey100)
const overlayBg = colors.greyOpacity700;     // Modal/sheet scrim (75% opacity)
```

## Typography Usage Patterns

TDS provides 7 main typography levels. Use the `Text` component or apply tokens:

| Context | Typography Level | Size |
|---------|-----------------|------|
| Page title | Typography 1 | 30px |
| Section header | Typography 2-3 | 26-22px |
| Card title | Typography 4 | 20px |
| Body emphasis | Typography 5 | 17px |
| Body default | Typography 6 | 15px |
| Caption/helper | Typography 7 | 13px |

Font family: `"Toss Product Sans", "Tossface", "SF Pro KR", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", Roboto, "Noto Sans KR", sans-serif`

## Overlay Pattern (useDialog, useToast, useBottomSheet)

```tsx
import { useDialog, useToast, useBottomSheet } from '@toss/tds-mobile';

function MyComponent() {
  const dialog = useDialog();
  const toast = useToast();
  const bottomSheet = useBottomSheet();

  // Alert
  const handleAlert = () => dialog.alert({
    title: 'Alert Title',
    description: 'Alert message'
  });

  // Confirm
  const handleConfirm = async () => {
    const ok = await dialog.confirm({
      title: 'Confirm',
      description: 'Proceed?',
      confirmButton: { label: 'Yes' },
      cancelButton: { label: 'No' }
    });
    if (ok) { /* proceed */ }
  };

  // Toast
  const handleToast = () => toast.open({ message: 'Done!' });

  // Bottom Sheet
  const handleSheet = () => bottomSheet.open({
    title: 'Options',
    content: <MySheetContent />
  });
}
```

## Button Patterns

```tsx
import { Button } from '@toss/tds-mobile';

// Primary CTA (most prominent)
<Button color="primary" variant="fill" size="xlarge" display="block">
  Continue
</Button>

// Secondary action
<Button color="primary" variant="weak" size="large">
  Cancel
</Button>

// Destructive
<Button color="danger" variant="fill" size="large">
  Delete
</Button>

// Loading state
<Button color="primary" loading>
  Processing...
</Button>

// Full-width bottom CTA
<Button color="primary" variant="fill" size="xlarge" display="full">
  Submit
</Button>
```

### Button CSS Customization

```css
/* Override via CSS custom properties */
.custom-button {
  --button-background-color: var(--tds-blue-500);
  --button-pressed-background-color: var(--tds-blue-700);
  --button-color: #ffffff;
}
```

## TDS Compliance Checklist

When reviewing or building UI, verify:

- [ ] All colors use TDS tokens (`colors.*`), no hardcoded hex
- [ ] Typography follows TDS scale (13-30px range), no arbitrary sizes
- [ ] Interactive elements use TDS components (Button, Switch, etc.)
- [ ] Dialogs use useDialog hook, not custom modals
- [ ] Toasts use useToast hook
- [ ] Bottom panels use useBottomSheet or BottomSheet component
- [ ] List items use ListRow component
- [ ] App root wrapped with TDSMobileAITProvider
- [ ] Font family uses TDS font stack
- [ ] Line heights follow 1.5x ratio
- [ ] Minimum text size >= 13px
- [ ] Loading states use Loader or Skeleton
- [ ] Progress indicators use ProgressBar or ProgressStepper

## Package Compatibility

| Platform | Framework Version | TDS Package |
|----------|-------------------|-------------|
| Web | `@apps-in-toss/web-framework` < 1.0.0 | `@toss-design-system/mobile` |
| Web | `@apps-in-toss/web-framework` >= 1.0.0 | `@toss/tds-mobile` |
| React Native | `@apps-in-toss/framework` < 1.0.0 | `@toss-design-system/react-native` |
| React Native | `@apps-in-toss/framework` >= 1.0.0 | `@toss/tds-react-native` |

Migration: Replace package name in imports while keeping same component APIs.

## v1 to v2 Migration Quick Reference

Key prop renames (full list in [references/migration-v2.md](references/migration-v2.md)):

| Component | v1 Prop | v2 Prop |
|-----------|---------|---------|
| Button | type | color |
| Button | style | variant |
| Button | htmlType | type |
| Button size | tiny/big | small/xlarge |
| Badge | type | color |
| IconButton | label | aria-label (required) |
| TextButton | typography (t7) | size (xsmall) |
| BottomCTA | TypeA/TypeB | Single/Double |
| ListRow padding | extraSmall/small/medium/large | small/medium/large/xlarge |

**Automated migration**: `pnpm add -D @toss/tds-migration && pnpm exec tds-migrate all --path "."`

## UX Writing (Toss Voice)

- Use casual speech consistently (해요체)
- Active voice: "했어요" over "됐어요"
- Frame positively - explain what users CAN do
- Avoid formal honorifics

## Detailed References

- **Color tokens & hex values**: [references/colors.md](references/colors.md)
- **Typography scale & accessibility**: [references/typography.md](references/typography.md)
- **Full component list & API details**: [references/components.md](references/components.md)
- **v1→v2 migration & breaking changes**: [references/migration-v2.md](references/migration-v2.md)
