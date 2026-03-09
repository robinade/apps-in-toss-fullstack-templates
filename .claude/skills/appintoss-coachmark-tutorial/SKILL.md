---
name: appintoss-coachmark-tutorial
description: Implements coachmark tutorials, onboarding walkthroughs, spotlight overlays, and step-by-step feature guides for mobile and web apps. Use this skill whenever the user needs to build user onboarding flows, coachmarks, product tours, tooltip guides, feature highlights, spotlight tutorials, or first-time user experience (FTUE) screens. Also use when they mention terms like walkthrough, guided tour, onboarding slides, carousel onboarding, instructional overlay, or tutorial tooltips, even if they don't explicitly say "coachmark."
---

# Coachmark Tutorial Implementation

Build effective onboarding experiences that guide new users through app features using two proven patterns: **Carousel Onboarding** (fullscreen slides) and **Spotlight Step Tour** (in-context highlights).

## When to use which pattern

**Carousel Onboarding** - fullscreen swipeable slides introducing the app before first use:
- App-level value proposition (what the app does, why it matters)
- Shown once before or after login
- Best for: first launch, major version updates, feature suites

**Spotlight Step Tour** - overlay that highlights specific UI elements one by one:
- Feature-level guidance pointing at actual buttons/areas
- Shown in-context on the real UI with dimmed background
- Best for: specific feature discovery, post-onboarding tips, new feature announcements

## Architecture overview

```
features/onboarding/
  hooks/useOnboarding.ts        # State management + persistence
  hooks/useCoachmark.ts         # Spotlight step tour controller
  OnboardingScreen.tsx           # Carousel container
  slides/                        # Individual slide components
  components/
    SpotlightOverlay.tsx         # Dim overlay with cutout hole
    CoachmarkTooltip.tsx         # Positioned tooltip with arrow
    StepIndicator.tsx            # Dot/progress indicator
```

## Pattern 1: Carousel Onboarding

### Step definition

```typescript
interface OnboardingSlide {
  id: string;
  component: React.ComponentType;
  // Optional: analytics event name
  trackingEvent?: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  { id: 'value-prop', component: SlideValueProp },
  { id: 'key-feature', component: SlideKeyFeature },
  { id: 'social-proof', component: SlideSocialProof },
  { id: 'get-started', component: SlideGetStarted },
];
```

Keep slides to 3-5 maximum. Each slide should communicate one idea with a visual + short headline + one-line description.

### Carousel container with Embla

```tsx
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';

function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  const isLastSlide = selectedIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Skip button - hidden on last slide */}
      {!isLastSlide && (
        <button onClick={onComplete} className="absolute top-4 right-4 z-10 text-sm text-muted-foreground">
          Skip
        </button>
      )}

      {/* Carousel */}
      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {ONBOARDING_SLIDES.map(slide => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0">
              <slide.component />
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicator */}
      <div className="flex justify-center gap-2 pb-8">
        {scrollSnaps.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className="h-2 rounded-full"
            animate={{
              width: i === selectedIndex ? 24 : 8,
              backgroundColor: i === selectedIndex ? 'var(--accent)' : 'rgba(0,0,0,0.2)',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        ))}
      </div>
    </div>
  );
}
```

### Individual slide pattern

Each slide follows a consistent layout: **visual (40%) + text (30%) + CTA area (30%)**.

```tsx
function SlideKeyFeature() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full px-8 text-center"
      variants={containerVariants} initial="hidden" animate="visible"
    >
      {/* Visual - Lottie, illustration, or animated mockup */}
      <motion.div className="mb-6" variants={itemVariants}>
        {/* Your visual here */}
      </motion.div>

      {/* Headline */}
      <motion.h2 className="text-2xl font-bold mb-2" variants={itemVariants}>
        Take a photo, that's it
      </motion.h2>

      {/* Description - one line */}
      <motion.p className="text-muted-foreground" variants={itemVariants}>
        AI analyzes your meal in <span className="text-accent font-semibold">3 seconds</span>
      </motion.p>
    </motion.div>
  );
}

// Reusable animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};
```

### State persistence with useOnboarding

```typescript
const STORAGE_KEY = 'onboarding_completed';

function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const completed = localStorage.getItem(STORAGE_KEY);
        setShowOnboarding(completed !== 'true');
      } catch {
        setShowOnboarding(true); // Safe default: show onboarding on error
      } finally {
        setIsLoading(false);
      }
    };
    check();
  }, []);

  const completeOnboarding = useCallback(async () => {
    setShowOnboarding(false);
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
  }, []);

  const resetOnboarding = useCallback(async () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setShowOnboarding(true);
  }, []);

  return { showOnboarding, isLoading, completeOnboarding, resetOnboarding };
}
```

For apps-in-toss or React Native, replace `localStorage` with the platform's async storage (e.g., `SafeStorage`, `AsyncStorage`). See [references/patterns.md](references/patterns.md) for the async-safe version with timeout and retry.

## Pattern 2: Spotlight Step Tour

### Step definition

```typescript
interface CoachmarkStep {
  id: string;
  targetSelector: string;         // CSS selector of element to highlight
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;      // px around the target (default: 8)
  spotlightBorderRadius?: number; // round the cutout (default: 8)
  action?: 'next' | 'click-target'; // What advances the step
}

const FEATURE_TOUR_STEPS: CoachmarkStep[] = [
  {
    id: 'panda-tap',
    targetSelector: '[data-coachmark="panda"]',
    title: 'Tap the panda!',
    description: 'Tap to earn bamboo points',
    placement: 'bottom',
  },
  {
    id: 'points-display',
    targetSelector: '[data-coachmark="points"]',
    title: 'Your points',
    description: 'Points accumulate here',
    placement: 'bottom',
  },
  {
    id: 'reward-button',
    targetSelector: '[data-coachmark="reward"]',
    title: 'Claim rewards',
    description: 'Exchange points for rewards',
    placement: 'top',
  },
];
```

Add `data-coachmark` attributes to target elements in your UI - this decouples the tour from implementation details.

### useCoachmark hook

```typescript
function useCoachmark(tourId: string, steps: CoachmarkStep[]) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Measure the target element position
  useEffect(() => {
    if (!isActive) return;
    const step = steps[currentStep];
    const el = document.querySelector(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    }
  }, [isActive, currentStep, steps]);

  // Re-measure on scroll/resize
  useEffect(() => {
    if (!isActive) return;
    const update = () => {
      const el = document.querySelector(steps[currentStep].targetSelector);
      if (el) setTargetRect(el.getBoundingClientRect());
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isActive, currentStep, steps]);

  const start = useCallback(() => { setCurrentStep(0); setIsActive(true); }, []);
  const next = useCallback(() => {
    if (currentStep < steps.length - 1) setCurrentStep(c => c + 1);
    else { setIsActive(false); localStorage.setItem(`coachmark_${tourId}`, 'true'); }
  }, [currentStep, steps.length, tourId]);
  const skip = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(`coachmark_${tourId}`, 'true');
  }, [tourId]);

  const shouldShow = !localStorage.getItem(`coachmark_${tourId}`);

  return { isActive, currentStep, targetRect, step: steps[currentStep], start, next, skip, shouldShow, totalSteps: steps.length };
}
```

### SpotlightOverlay component

The overlay uses an SVG with a "hole" cut out where the target element is, creating the spotlight effect:

```tsx
function SpotlightOverlay({ targetRect, padding = 8, borderRadius = 8, onOverlayClick }: {
  targetRect: DOMRect; padding?: number; borderRadius?: number; onOverlayClick?: () => void;
}) {
  const { width: W, height: H } = { width: window.innerWidth, height: window.innerHeight };
  const x = targetRect.left - padding;
  const y = targetRect.top - padding;
  const w = targetRect.width + padding * 2;
  const h = targetRect.height + padding * 2;
  const r = borderRadius;

  return (
    <motion.div
      className="fixed inset-0 z-[9998]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onOverlayClick}
    >
      <svg width={W} height={H} className="absolute inset-0">
        <defs>
          <mask id="spotlight-mask">
            <rect width={W} height={H} fill="white" />
            <rect x={x} y={y} width={w} height={h} rx={r} fill="black" />
          </mask>
        </defs>
        <rect width={W} height={H} fill="rgba(0,0,0,0.6)" mask="url(#spotlight-mask)" />
      </svg>
    </motion.div>
  );
}
```

### CoachmarkTooltip component

```tsx
function CoachmarkTooltip({ step, targetRect, currentStep, totalSteps, onNext, onSkip }: {
  step: CoachmarkStep; targetRect: DOMRect;
  currentStep: number; totalSteps: number;
  onNext: () => void; onSkip: () => void;
}) {
  const pos = calculateTooltipPosition(step.placement, targetRect);

  return (
    <motion.div
      className="fixed z-[9999] w-72 bg-white rounded-2xl shadow-xl p-4"
      style={{ left: pos.left, top: pos.top }}
      initial={{ opacity: 0, y: step.placement === 'top' ? 10 : -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Arrow pointing to target */}
      <div className={`absolute w-3 h-3 bg-white rotate-45 ${arrowClass(step.placement)}`} />

      <h3 className="font-bold text-base mb-1">{step.title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{currentStep + 1}/{totalSteps}</span>
        <div className="flex gap-2">
          <button onClick={onSkip} className="text-xs text-muted-foreground">Skip</button>
          <button onClick={onNext} className="text-xs font-semibold text-white bg-accent px-3 py-1 rounded-full">
            {currentStep === totalSteps - 1 ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function calculateTooltipPosition(placement: string, rect: DOMRect) {
  const GAP = 12;
  switch (placement) {
    case 'bottom': return { left: rect.left + rect.width / 2 - 144, top: rect.bottom + GAP };
    case 'top':    return { left: rect.left + rect.width / 2 - 144, top: rect.top - GAP };
    case 'left':   return { left: rect.left - 288 - GAP, top: rect.top + rect.height / 2 - 40 };
    case 'right':  return { left: rect.right + GAP, top: rect.top + rect.height / 2 - 40 };
    default:       return { left: rect.left, top: rect.bottom + GAP };
  }
}

function arrowClass(placement: string) {
  switch (placement) {
    case 'bottom': return '-top-1.5 left-1/2 -translate-x-1/2';
    case 'top':    return '-bottom-1.5 left-1/2 -translate-x-1/2';
    case 'left':   return '-right-1.5 top-1/2 -translate-y-1/2';
    case 'right':  return '-left-1.5 top-1/2 -translate-y-1/2';
    default: return '';
  }
}
```

### Composing the tour

```tsx
function FeatureTour() {
  const tour = useCoachmark('main-tour', FEATURE_TOUR_STEPS);

  useEffect(() => {
    if (tour.shouldShow) tour.start();
  }, [tour.shouldShow]);

  if (!tour.isActive || !tour.targetRect) return null;

  return (
    <AnimatePresence>
      <SpotlightOverlay targetRect={tour.targetRect} onOverlayClick={tour.next} />
      <CoachmarkTooltip
        step={tour.step} targetRect={tour.targetRect}
        currentStep={tour.currentStep} totalSteps={tour.totalSteps}
        onNext={tour.next} onSkip={tour.skip}
      />
    </AnimatePresence>
  );
}
```

## UX guidelines

These principles determine whether users find the coachmark helpful or annoying:

1. **3-5 steps max** - Human short-term memory handles 3-4 items. More than 5 steps and users start dismissing without reading.

2. **One idea per step** - Each tooltip/slide should communicate exactly one concept. If you need a paragraph, split into two steps.

3. **Always offer skip** - Never trap users. Provide skip on every step and the entire flow. Some users are explorers who learn by doing.

4. **Show only once** - Persist completion state. Coachmarks that reappear on every session are the fastest way to frustrate users.

5. **Context over explanation** - Point at the actual UI element rather than describing it abstractly. "Tap here to earn points" next to the button beats a separate tutorial screen.

6. **Delay appropriately** - Don't fire the tour instantly on page load. Wait 500-1000ms for the UI to settle and the user to orient themselves.

7. **Respect reduced motion** - Check `prefers-reduced-motion` and skip animations. Still show content but without transitions.

8. **Keep text scannable** - Bold the key action word. Keep descriptions under 15 words. Users scan, they don't read.

For detailed UX research and anti-patterns, see [references/ux-guidelines.md](references/ux-guidelines.md).

## Animation recipes

Reusable Framer Motion patterns for polished coachmark animations:

```typescript
// Staggered entrance for slide content
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

// Floating idle animation for mascot/icon
const float = { y: [0, -8, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } };

// Scale pop for badges/checkmarks
const pop = { hidden: { scale: 0, opacity: 0 }, visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 15 } } };

// Glow pulse for highlighted elements
const glow = { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } };
```

## Accessibility checklist

- [ ] Support `prefers-reduced-motion`: disable animations, still show content
- [ ] Keyboard navigation: Tab through steps, Enter to advance, Escape to skip
- [ ] ARIA labels on dot indicators: `aria-label="Go to slide 2"`
- [ ] Focus management: move focus to tooltip when it appears
- [ ] Screen reader announcements for step changes
- [ ] Touch targets minimum 44x44px for mobile
- [ ] Sufficient color contrast on overlay text (white on dark overlay)

## Implementation checklist

```
Coachmark Implementation:
- [ ] Choose pattern (Carousel vs Spotlight vs both)
- [ ] Define steps/slides (max 5)
- [ ] Build state hook with storage persistence
- [ ] Create slide/tooltip components
- [ ] Add data-coachmark attributes to target elements
- [ ] Wire up skip functionality on every step
- [ ] Add dot/progress indicator
- [ ] Add entrance/exit animations
- [ ] Test prefers-reduced-motion
- [ ] Test on mobile viewport sizes
- [ ] Verify one-time display behavior
```

## Reference files

- **[references/patterns.md](references/patterns.md)**: Advanced patterns including async storage for apps-in-toss, conditional tours, analytics integration, and multi-tour sequencing
- **[references/ux-guidelines.md](references/ux-guidelines.md)**: Detailed UX research from NN/g, cognitive load theory, anti-patterns, and A/B testing strategies for coachmarks
