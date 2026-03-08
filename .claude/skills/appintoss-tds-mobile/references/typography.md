# TDS Mobile Typography System

## Font Family Stack

```css
font-family: "Toss Product Sans", "Tossface", "SF Pro KR", "SF Pro Display",
  "SF Pro Icons", -apple-system, BlinkMacSystemFont, "Basier Square",
  "Apple SD Gothic Neo", Roboto, "Noto Sans KR", "Noto Sans", "Helvetica Neue";
```

## Primary Typography Scale (Typography 1-7)

| Token | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| Typography 1 | 30px | 40px | Hero heading, page title |
| Typography 2 | 26px | 35px | Large section header |
| Typography 3 | 22px | 31px | Standard heading, card title |
| Typography 4 | 20px | 29px | Small heading, subheader |
| Typography 5 | 17px | 25.5px | Large body, emphasis text |
| Typography 6 | 15px | 22.5px | **Default body text** |
| Typography 7 | 13px | 19.5px | Small body, caption |

## Sub Typography Scale (st1-st13)

| Token | Size | Line Height |
|-------|------|-------------|
| sub Typography 1 | 11px | 16.5px |
| sub Typography 2 | 12px | 18px |
| sub Typography 3 | 13px | 19.5px |
| sub Typography 4 | 14px | 21px |
| sub Typography 5 | 15px | 22.5px |
| sub Typography 6 | 16px | 24px |
| sub Typography 7 | 17px | 25.5px |
| sub Typography 8 | 18px | 27px |
| sub Typography 9 | 20px | 30px |
| sub Typography 10 | 22px | 33px |
| sub Typography 11 | 24px | 36px |
| sub Typography 12 | 26px | 39px |
| sub Typography 13 | 29px | 43.5px |

## Font Weight Variants

Each typography token supports three weights:
- **Light** - De-emphasized text
- **Regular** - Default weight
- **Bold** - Emphasized text, headings

## Line Height Ratio

Consistent 1.5x ratio: `lineHeight = fontSize * 1.5`

## Accessibility: Larger Text Support

| Scale | Ratio | Example (Typography 6) |
|-------|-------|------------------------|
| Default | 100% | 15px |
| A11y Large | 112% | 16.8px |
| A11y xLarge | 124% | 18.6px |
| A11y xxLarge | 141% | 21.2px |
| A11y xxxLarge | 310% | 46.5px |

- iOS: Discrete steps (Large, xLarge, xxLarge, xxxLarge)
- Android: Continuous scaling
- Web: CSS custom properties for dynamic scaling

## Typography Usage Rules

1. Use Typography 6 (15px) as default body text
2. Heading hierarchy: T1 > T2 > T3 > T4 (descending importance)
3. Never go below Typography 7 (13px) for readable text
4. Use Sub Typography for fine-grained sizing between main levels
5. Always use token names, never hardcode pixel values
6. Support accessibility scaling - avoid fixed dimensions
7. Bold weight for emphasis, Light for de-emphasis
