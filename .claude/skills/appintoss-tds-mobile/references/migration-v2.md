# TDS Mobile v1 to v2 Migration Guide

## Package Migration

### Old → New Package Names

| Old Package | New Package | Version |
|---|---|---|
| @toss-design-system/colors | @toss/tds-colors | ^0 |
| @toss-design-system/mobile | @toss/tds-mobile | ^2 |
| @toss-design-system/mobile-bedrock | @toss/tds-mobile-ait | ^1 |
| @toss-design-system/react-native | @toss/tds-react-native | ^1 |

### Automated Migration CLI

```bash
pnpm add -D @toss/tds-migration
pnpm exec tds-migrate all --path "."
```

### Provider Rename

```tsx
// Before (deprecated)
import { TDSMobileBedrockProvider } from '@toss-design-system/mobile-bedrock';
<TDSMobileBedrockProvider>...</TDSMobileBedrockProvider>

// After (current)
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
<TDSMobileAITProvider>...</TDSMobileAITProvider>
```

## v1 → v2 Breaking Prop Changes

### Badge
- `type` → `color`
- `style` → `variant`
- `htmlStyle` → `style`

### Button
- `type` → `color`
- `style` → `variant`
- `htmlType` → `type`
- `htmlStyle` → `style`
- Size: `tiny` → `small`, `big` → `xlarge`

### IconButton
- `label` → `aria-label` (now required)

### TextButton
- `typography` → `size` (e.g. `t7` → `xsmall`)

### Top
- `subtitle1` → `subtitleTop`
- `subtitle2` → `subtitleBottom`

### Sub-component Renames
- `BoardRow.RightArrow` → `BoardRow.ArrowIcon`
- `BottomCTA.TypeA` → `BottomCTA.Single`
- `BottomCTA.TypeB` → `BottomCTA.Double`

### ListRow Padding Sizes
- `extraSmall` → `small`
- `small` → `medium`
- `medium` → `large`
- `large` → `xlarge`

## granite.config.ts Brand Configuration

```typescript
brand: {
  displayName: 'your-app-name',   // Korean preferred
  primaryColor: '#3182F6',         // 6-digit hex, must meet contrast
  icon: 'https://...'             // 600x600px square, no rounded corners
}
```

## UX Writing Guidelines (Toss Voice)

1. Use casual speech (해요체)
2. Active voice: "했어요" over "됐어요"
3. Frame positively - what users CAN do
4. Avoid formal honorifics - use "있다" and "에게"
5. Avoid Sino-Korean noun stacking - use verb forms
