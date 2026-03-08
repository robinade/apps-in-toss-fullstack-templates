# TDS Mobile Component Reference

## Installation

```bash
npm install @toss/tds-mobile @toss/tds-mobile-ait @emotion/react@^11 react@^18 react-dom@^18
```

## Provider Setup (Required)

```tsx
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';

function App({ Component, pageProps }) {
  return (
    <TDSMobileAITProvider>
      <Component {...pageProps} />
    </TDSMobileAITProvider>
  );
}
```

---

## Button

```tsx
import { Button } from '@toss/tds-mobile';
```

| Prop | Default | Type |
|------|---------|------|
| as | 'button' | "button" \| "a" |
| color | 'primary' | "primary" \| "danger" \| "light" \| "dark" |
| variant | 'fill' | "fill" \| "weak" |
| display | 'inline' | "inline" \| "block" \| "full" |
| size | 'xlarge' | "small" \| "medium" \| "large" \| "xlarge" |
| loading | - | boolean |
| disabled | - | boolean |
| type | - | "button" \| "submit" \| "reset" |

CSS vars: `--button-color`, `--button-background-color`, `--button-pressed-background-color`, `--button-disabled-opacity-color`, `--button-loader-color`

## Badge

| Prop | Type | Values |
|------|------|--------|
| variant | string | "fill" \| "weak" |
| size | string | "xsmall" \| "small" \| "medium" \| "large" |
| color | string | "blue" \| "teal" \| "green" \| "red" \| "yellow" \| "elephant" |

## Checkbox

Two variants: `<Checkbox.Circle />` and `<Checkbox.Line />`

| Prop | Default | Type |
|------|---------|------|
| inputType | 'checkbox' | "checkbox" \| "radio" |
| size | 24 | number |
| checked | - | boolean |
| onCheckedChange | - | (checked: boolean) => void |
| defaultChecked | - | boolean |
| disabled | - | boolean |

`aria-label` is MANDATORY.

## Switch

| Prop | Default | Type |
|------|---------|------|
| checked | - | boolean |
| disabled | false | boolean |
| name | - | string |
| hasTouchEffect | true | boolean |
| onChange | - | function |

```tsx
const [checked, setChecked] = useState(true);
<Switch checked={checked} onChange={() => setChecked(prev => !prev)} />
```

## IconButton

| Prop | Default | Type |
|------|---------|------|
| aria-label | required | string |
| variant | 'clear' | "fill" \| "clear" \| "border" |
| src | - | string |
| name | - | string |
| color | - | string |
| bgColor | adaptive.greyOpacity100 | string |
| iconSize | 24 | number |

## TextButton

| Prop | Type | Values |
|------|------|--------|
| size | string | "xsmall" \| "small" \| "medium" \| "large" \| "xlarge" \| "xxlarge" |
| variant | string | "arrow" \| "underline" \| "clear" |
| disabled | boolean | - |

## TextField / TextArea / SearchField

- `TextField` - Single-line text input with label, placeholder, error
- `SplitTextField` - Multi-segment input (phone, date)
- `TextArea` - Multi-line input with label, maxLength
- `SearchField` - Search input with magnifier icon, delete button, 44px min height, 12px border-radius

## Tab

| Prop | Default | Type |
|------|---------|------|
| onChange | required | (index: number, key?: string \| number) => void |
| size | "large" | "large" \| "small" |
| fluid | false | boolean (horizontal scroll for 4+ tabs) |
| itemGap | - | number |
| ariaLabel | - | string |

`Tab.Item` props: `selected` (required boolean), `redBean` (boolean - red notification dot)

```tsx
const [selected, setSelected] = useState(0);
<Tab onChange={(index) => setSelected(index)}>
  <Tab.Item selected={selected === 0}>Tab 1</Tab.Item>
  <Tab.Item selected={selected === 1}>Tab 2</Tab.Item>
</Tab>
```

## SegmentedControl

| Prop | Default | Type |
|------|---------|------|
| size | "small" | "small" \| "large" |
| alignment | "fixed" | "fixed" \| "fluid" |
| value | - | string |
| defaultValue | - | string |
| onChange | - | (v: string) => void |

`SegmentedControl.Item` props: `children` (required), `value` (required)

## BottomSheet

| Prop | Type | Description |
|------|------|-------------|
| open | boolean | Visibility control |
| onClose | function | Close handler |
| header | ReactNode | Title area |
| headerDescription | ReactNode | Subtitle |
| cta | ReactNode | Bottom action |
| children | ReactNode | Main content |
| hasTextField | boolean | Elevate above keyboard |
| expandBottomSheet | boolean | Allow full-screen expansion |
| maxHeight | string | Custom max height |

Sub-components: `BottomSheet.Header`, `BottomSheet.HeaderDescription`, `BottomSheet.CTA`, `BottomSheet.DoubleCTA`, `BottomSheet.Select`

## Dialog (AlertDialog / ConfirmDialog)

Use via `useDialog` hook:

```tsx
const { openAlert, openConfirm, openAsyncConfirm } = useDialog();

// Alert
openAlert({ title: 'Title', description: '...', alertButton: 'OK' });

// Confirm
openConfirm({
  title: 'Delete?',
  description: '...',
  confirmButton: 'Delete',
  cancelButton: 'Cancel'
});

// Async Confirm (auto loading state on button)
openAsyncConfirm({
  title: 'End session?',
  confirmButton: 'End',
  onConfirmClick: () => apiCall()
});
```

## Toast

| Prop | Default | Type |
|------|---------|------|
| open | - | boolean |
| position | - | "top" \| "bottom" |
| text | - | string |
| duration | 3000 | number (ms) |
| onClose | - | function |
| leftAddon | - | ReactNode (Toast.Icon or Toast.Lottie) |
| button | - | ReactNode (bottom position only) |
| higherThanCTA | false | boolean |
| aria-live | "polite" | "polite" \| "assertive" |

## Modal

Sub-components: `Modal.Overlay`, `Modal.Content`

| Prop | Type |
|------|------|
| open | boolean |
| onOpenChange | (open: boolean) => void |
| onExited | function (after close animation) |
| portalContainer | HTMLElement (default: document.body) |

## Menu

Components: `Menu.Dropdown`, `Menu.Header`, `Menu.DropdownItem`, `Menu.DropdownCheckItem`, `Menu.Trigger`

Menu.Trigger props: `open`, `placement` (top/bottom/left/right + start/end), `onOpen`, `onClose`, `dropdown`, `children`

## ListRow

Configurable list item with icon, text, description, right action area. Sub-components: `ListRow.Left`, `ListRow.Right`, `ListRow.ArrowIcon`

Padding sizes: "small" \| "medium" \| "large" \| "xlarge"

## Other Components

| Component | Purpose |
|-----------|---------|
| Border | Divider - variants: "full", "padding24", "height16" |
| Loader | Spinner - sizes: small/medium/large, types: primary/dark/light |
| ProgressBar | Linear progress - progress: 0.0-1.0, sizes: light/normal/bold |
| ProgressStepper | Multi-step - variants: "compact" \| "icon" |
| Rating | Star rating - sizes: tiny-big, variants: full/compact/iconOnly |
| Result | Outcome page - figure + title + description + button |
| Tooltip | Contextual help - placement: top/bottom, sizes: small/medium/large |
| NumericSpinner | Counter - sizes: tiny/small/medium/large, min/max number |
| Slider | Range selector |
| Stepper | Step increment/decrement |
| GridList | Grid layout - column: 1/2/3 |
| BoardRow | Board-style row, BoardRow.ArrowIcon |
| TableRow | Table-formatted row |
| Skeleton | Loading placeholder |
| Bubble | Chat/speech bubble |
| BottomInfo | Bottom fixed info bar |
| BottomCTA.Single | Single bottom CTA |
| BottomCTA.Double | Dual bottom CTA |
| FixedBottomCTA | Fixed position bottom CTA |
| Agreement (V3/V4) | Terms agreement checkbox group |
| Asset | Graphic asset display |
| BarChart | Bar chart visualization |
| Keypad | AlphabetKeypad, NumberKeypad, FullSecureKeypad |
| Top | Top app bar / navigation header |
| Paragraph | Styled text block |
| Post | Social-style post card |
| Highlight | Text highlighting |
| ListHeader | List section header |
| ListFooter | List section footer |

---

## Overlay Extension (overlay-kit)

TDS wraps [overlay-kit](https://overlay-kit.slash.page) for overlay management.

### Setup

```tsx
import { OverlayProvider } from 'overlay-kit';
// Already included in TDSMobileAITProvider
```

### Core API

```tsx
import { overlay } from 'overlay-kit';

// Open overlay
overlay.open(({ isOpen, close, unmount }) => (
  <Dialog isOpen={isOpen} onClose={close} />
));

// Async overlay (returns Promise)
const result = await overlay.openAsync<boolean>(({ isOpen, close }) => (
  <ConfirmDialog isOpen={isOpen} close={close} />
));

// Control
overlay.closeAll();    // Close all (keep in memory)
overlay.unmountAll();  // Remove all from DOM
```

### useOverlay Hook

```tsx
import { useOverlay } from 'overlay-kit';

const overlay = useOverlay();
overlay.open(({ isOpen, close }) => <MyOverlay isOpen={isOpen} onClose={close} />);
overlay.close();
overlay.exit(); // unmount
```

### close() vs unmount()

- `close()` - Plays animations, keeps state in memory. Use for reopenable overlays.
- `unmount()` - Immediately removes from DOM. Use after animations complete or for cleanup.

For 10+ overlays, always call `unmount()` after animation to prevent memory leaks.
