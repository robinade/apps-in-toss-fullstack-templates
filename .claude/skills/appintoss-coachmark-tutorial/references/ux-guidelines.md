# Coachmark UX Guidelines

## Contents
- Cognitive load principles
- When to use coachmarks (and when not to)
- Design patterns by context
- Anti-patterns
- Mobile-specific considerations
- Testing and optimization
- Accessibility requirements

## Cognitive load principles

Research from NN/g (Nielsen Norman Group) and cognitive psychology informs these guidelines:

**Miller's Law**: Working memory holds 3-4 items. A coachmark tour with more than 5 steps forces users to remember earlier steps while processing new ones. Result: they remember nothing.

**The Paradox of the Active User**: Users skip instructions to start doing. John Carroll's research shows people learn better by interacting than by reading. Coachmarks that require action ("tap here") outperform passive ones ("this is where you tap").

**Recognition over Recall**: Point at the actual element rather than describing it. "Tap this button" with an arrow is always better than "The settings button is in the top-right corner."

**Progressive Disclosure**: Don't explain everything at once. Show the minimum needed for the first task. Reveal advanced features later, ideally triggered by the user reaching that context naturally.

## When to use coachmarks

**Good use cases:**
- First-time user orientation to a novel interaction pattern
- Pointing out a new feature added in an update
- Explaining a non-standard UI element that can't be made more intuitive
- Complex multi-step workflows where the order matters

**Bad use cases (use alternatives instead):**
- Explaining standard UI patterns (hamburger menus, pull-to-refresh) - users already know these
- Compensating for confusing design - fix the design instead
- Marketing messages disguised as tutorials - users will distrust future coachmarks
- Showing every feature at once - this is an information dump, not guidance

**Alternative approaches:**
- **Empty states**: Show helpful prompts when content areas are empty
- **Contextual hints**: Small inline text that appears near relevant UI at the right moment
- **Progressive onboarding**: Unlock and explain features as users reach them naturally
- **Tooltips on hover/long-press**: User-initiated rather than system-initiated

## Design patterns by context

### First launch onboarding (carousel)

**Goal**: Communicate value proposition, not feature list.
**Timing**: Before or right after account creation.
**Best practice**: 3-4 slides ending with a CTA.

Structure each slide as:
1. **Visual** (60% of slide): Illustration, Lottie animation, or mockup
2. **Headline** (1 line): What can the user do?
3. **Subtext** (1 line): Why should they care?

Example slide sequence for a food tracking app:
1. "Snap a photo, that's it" - AI does the calorie counting
2. "Track your progress" - Weekly/monthly visual dashboard
3. "Build healthy habits" - Streak system keeps you motivated
4. [CTA] "Get started with Toss" / "Browse first"

### New feature announcement (spotlight)

**Goal**: Draw attention to one specific addition.
**Timing**: First session after update, after the user lands on the relevant screen.
**Best practice**: 1-2 steps maximum. Single tooltip with "Got it" button.

```
[Spotlight on new button]
"New! Share your results with friends and earn bonus points."
[Got it]
```

### Complex workflow guidance (step tour)

**Goal**: Walk through a multi-step process.
**Timing**: First time the user enters the workflow.
**Best practice**: 3-5 steps, each pointing at the next action.

Ensure each step's CTA is the actual next action: "Tap here" should advance both the tour and the real workflow.

## Anti-patterns

### The Wall of Text
Tooltip with 3+ sentences. Users see a paragraph and immediately close it. Fix: one sentence per tooltip, bold the action word.

### The Inescapable Tour
No skip button, must complete all steps. Users feel trapped and frustrated. Fix: skip button on every step, never block the UI.

### The Returning Ghost
Tour reappears on every app launch. Users associate the coachmark with annoyance. Fix: persist completion in storage, never show again.

### The Information Dump
7+ steps covering every feature. Users zone out after step 3. Fix: max 5 steps covering only the core loop.

### The Premature Tour
Tour fires before the page finishes loading, pointing at elements that haven't rendered yet. Fix: wait for UI to settle (500-1000ms delay), verify target elements exist before starting.

### The Invisible Context
Tooltip says "Your dashboard shows weekly progress" but the dashboard is hidden behind the overlay. Fix: spotlight must show the actual element being discussed.

### The Modal Disguise
Fullscreen overlay that looks like an error or ad. Users dismiss it reflexively. Fix: make the instructional nature obvious - use casual styling, hand-drawn feel, or illustrations.

## Mobile-specific considerations

### Touch targets
Minimum 44x44px for any tappable area in the coachmark UI (Skip, Next, Done buttons, dot indicators). On Android, Material Design recommends 48x48px.

### Screen edges
Tooltips must never overflow the viewport. Implement boundary detection:
```typescript
function clampToViewport(left: number, top: number, tooltipWidth: number, tooltipHeight: number) {
  const MARGIN = 16;
  return {
    left: Math.max(MARGIN, Math.min(left, window.innerWidth - tooltipWidth - MARGIN)),
    top: Math.max(MARGIN, Math.min(top, window.innerHeight - tooltipHeight - MARGIN)),
  };
}
```

### Orientation changes
Re-measure target positions on orientation change and window resize. The `useCoachmark` hook handles this via scroll/resize listeners.

### Safe areas
Account for notches, status bars, and home indicators. Use `env(safe-area-inset-*)` in CSS or `safe-area-top`/`safe-area-bottom` utility classes.

### Haptic feedback
Add light haptic on step transitions. Use success haptic on tour completion. See patterns.md for implementation.

### Swipe gestures
For carousel onboarding on mobile, swipe is the primary navigation. Ensure dots/buttons are supplementary, not the only way to advance.

## Testing and optimization

### A/B test these variables
1. **Number of steps**: 3 vs 5 (measure completion rate)
2. **With vs without coachmark**: Does the tour actually improve activation?
3. **Timing**: Immediate vs delayed (after first action)
4. **Copy tone**: Instructional ("Tap here to...") vs benefit-led ("Earn points by...")

### Key metrics
| Metric | Good | Needs Work |
|--------|------|------------|
| Completion rate | >60% | <40% |
| Skip rate | <30% | >50% |
| Feature adoption (with tour) | 40-60% lift | <20% lift |
| Time to first action | Decreased | No change |

### User testing protocol
1. Recruit 5 new users who haven't seen the app
2. Ask them to "explore the app and complete [core task]"
3. Observe: Do they read the coachmarks? Do they understand them? Do they skip?
4. After: Ask "What does this app do?" and "How do you [core action]?"

If users can answer both questions correctly, the onboarding works regardless of whether they read every tooltip.

## Accessibility requirements

### WCAG compliance
- **1.4.3 Contrast**: Tooltip text must have 4.5:1 contrast ratio against background
- **2.1.1 Keyboard**: All coachmark controls must be keyboard accessible
- **2.4.3 Focus Order**: Focus must move to the tooltip when it appears
- **4.1.2 Name, Role, Value**: Tooltips need appropriate ARIA roles

### Reduced motion
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Skip animations but still show content
const variants = prefersReducedMotion
  ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.01 } } }
  : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
```

### Screen readers
```tsx
<div role="dialog" aria-label={`Step ${currentStep + 1} of ${totalSteps}: ${step.title}`}>
  <h3 id="coachmark-title">{step.title}</h3>
  <p id="coachmark-desc">{step.description}</p>
</div>

{/* Announce step changes */}
<div aria-live="polite" className="sr-only">
  Step {currentStep + 1} of {totalSteps}: {step.title}
</div>
```

### Focus trap
When the spotlight overlay is active, trap focus within the tooltip to prevent users from tabbing to hidden elements behind the overlay:

```typescript
useEffect(() => {
  if (!isActive) return;
  const tooltip = document.querySelector('[role="dialog"]') as HTMLElement;
  if (tooltip) tooltip.focus();

  const handleTab = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { skip(); return; }
    if (e.key === 'Enter') { next(); return; }
    // Trap focus within tooltip
  };

  document.addEventListener('keydown', handleTab);
  return () => document.removeEventListener('keydown', handleTab);
}, [isActive, currentStep]);
```
