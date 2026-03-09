# Advanced Coachmark Patterns

## Contents
- Async storage with timeout (apps-in-toss / React Native)
- Conditional tour triggering
- Multi-tour sequencing
- Analytics integration
- Haptic feedback integration
- Library-based approach (react-joyride, shepherd.js)
- In-context guide overlays

## Async storage with timeout

For apps-in-toss or React Native where storage is async, wrap with timeout and retry to prevent the UI from hanging:

```typescript
const STORAGE_TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;

async function getItemWithTimeout(
  key: string,
  timeoutMs = STORAGE_TIMEOUT_MS,
  retries = MAX_RETRIES
): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      return await Promise.race([
        SafeStorage.getItem(key),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Storage timeout')), timeoutMs)
        ),
      ]);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
    }
  }
  return null;
}
```

Key principle: on storage error, default to **showing** the onboarding (safe default). A user seeing onboarding twice is better than a user never seeing it.

## Login-aware onboarding state

When onboarding includes a login step (common in apps-in-toss), you need guards to prevent the carousel from resetting mid-login:

```typescript
function useOnboarding() {
  const { isAuthenticated } = useAuth();
  const isLoginInProgressRef = useRef(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Skip state check during login to prevent carousel reset
    if (isLoginInProgressRef.current) return;
    if (isCompleted) { setShowOnboarding(false); return; }
    if (isAuthenticated) { setShowOnboarding(false); return; }
    // ... check storage
  }, [isAuthenticated, isCompleted]);

  const completeOnboarding = useCallback(async () => {
    isLoginInProgressRef.current = true;
    setIsCompleted(true);
    setShowOnboarding(false);
    await SafeStorage.setItem('onboarding_completed', 'true');
  }, []);

  return { showOnboarding, completeOnboarding, setLoginInProgress: (v: boolean) => { isLoginInProgressRef.current = v; } };
}
```

## Conditional tour triggering

Show different tours based on user context:

```typescript
type TourTrigger = {
  tourId: string;
  steps: CoachmarkStep[];
  condition: () => boolean;
  priority: number; // Lower = higher priority
};

const TOUR_TRIGGERS: TourTrigger[] = [
  {
    tourId: 'first-visit',
    steps: FIRST_VISIT_STEPS,
    condition: () => !localStorage.getItem('coachmark_first-visit'),
    priority: 1,
  },
  {
    tourId: 'new-feature-v2',
    steps: NEW_FEATURE_STEPS,
    condition: () => {
      const version = localStorage.getItem('app_version');
      return version !== '2.0' && !localStorage.getItem('coachmark_new-feature-v2');
    },
    priority: 2,
  },
];

function useConditionalTour() {
  const activeTour = useMemo(() =>
    TOUR_TRIGGERS
      .filter(t => t.condition())
      .sort((a, b) => a.priority - b.priority)[0] ?? null,
    []
  );

  return activeTour
    ? useCoachmark(activeTour.tourId, activeTour.steps)
    : { isActive: false, shouldShow: false };
}
```

## Multi-tour sequencing

Run tours in sequence across different screens:

```typescript
const TOUR_SEQUENCE = ['welcome-tour', 'camera-tour', 'results-tour'];

function useTourSequence() {
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('completed_tours') ?? '[]');
    setCompletedTours(new Set(saved));
  }, []);

  const nextTourId = TOUR_SEQUENCE.find(id => !completedTours.has(id)) ?? null;

  const completeTour = (tourId: string) => {
    const updated = new Set([...completedTours, tourId]);
    setCompletedTours(updated);
    localStorage.setItem('completed_tours', JSON.stringify([...updated]));
  };

  return { nextTourId, completeTour, isAllComplete: nextTourId === null };
}
```

## Analytics integration

Track coachmark engagement to optimize the flow:

```typescript
interface CoachmarkEvent {
  tour_id: string;
  step_id: string;
  step_index: number;
  total_steps: number;
  action: 'viewed' | 'next' | 'skip' | 'completed' | 'dismissed';
  time_on_step_ms: number;
}

function useCoachmarkWithAnalytics(tourId: string, steps: CoachmarkStep[]) {
  const tour = useCoachmark(tourId, steps);
  const stepStartTime = useRef(Date.now());

  useEffect(() => {
    if (tour.isActive) {
      const elapsed = Date.now() - stepStartTime.current;
      trackEvent({
        tour_id: tourId,
        step_id: tour.step.id,
        step_index: tour.currentStep,
        total_steps: tour.totalSteps,
        action: 'viewed',
        time_on_step_ms: 0,
      });
      stepStartTime.current = Date.now();
    }
  }, [tour.currentStep, tour.isActive]);

  const wrappedNext = () => {
    trackEvent({ /* ... action: 'next', time_on_step_ms */ });
    tour.next();
  };

  const wrappedSkip = () => {
    trackEvent({ /* ... action: 'skip' */ });
    tour.skip();
  };

  return { ...tour, next: wrappedNext, skip: wrappedSkip };
}
```

Key metrics to monitor:
- **Completion rate**: % of users who finish all steps (target: >60%)
- **Drop-off step**: which step loses the most users (redesign that step)
- **Time per step**: >5s on a step might mean confusing copy
- **Skip rate**: >40% overall skip rate means the tour is too long or not valuable

## Haptic feedback

For mobile apps, add haptic feedback to slide transitions and button taps:

```typescript
import { useHaptic } from '@/hooks/useHaptic';

function OnboardingScreen({ onComplete }) {
  const { vibrate, success } = useHaptic();

  const onSelect = useCallback(() => {
    vibrate('tickWeak'); // Light feedback on slide change
  }, [vibrate]);

  const handleComplete = () => {
    success(); // Strong success haptic on completion
    onComplete();
  };
}
```

## Library-based approach

If building a custom solution is too much, these libraries handle the spotlight tour pattern out of the box:

### react-joyride (recommended for React)

```bash
npm install react-joyride
```

```tsx
import Joyride from 'react-joyride';

const steps = [
  { target: '[data-coachmark="panda"]', content: 'Tap the panda to earn points!', placement: 'bottom' },
  { target: '[data-coachmark="points"]', content: 'Your points show here', placement: 'bottom' },
  { target: '[data-coachmark="reward"]', content: 'Exchange for rewards!', placement: 'top' },
];

function App() {
  const [run, setRun] = useState(() => !localStorage.getItem('tour_done'));

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous
        showSkipButton
        callback={(data) => {
          if (data.status === 'finished' || data.status === 'skipped') {
            localStorage.setItem('tour_done', 'true');
            setRun(false);
          }
        }}
        styles={{ options: { primaryColor: '#10B981', zIndex: 10000 } }}
      />
      <YourApp />
    </>
  );
}
```

### shepherd.js (framework-agnostic)

```bash
npm install react-shepherd shepherd.js
```

```tsx
import { ShepherdTour, ShepherdTourContext } from 'react-shepherd';
import 'shepherd.js/dist/css/shepherd.css';

const steps = [
  {
    id: 'step-1',
    attachTo: { element: '[data-coachmark="panda"]', on: 'bottom' },
    text: 'Tap the panda!',
    buttons: [
      { type: 'cancel', text: 'Skip' },
      { type: 'next', text: 'Next' },
    ],
  },
];

const tourOptions = { defaultStepOptions: { cancelIcon: { enabled: true } }, useModalOverlay: true };

function TourStarter() {
  const tour = useContext(ShepherdTourContext);
  useEffect(() => { if (!localStorage.getItem('tour_done')) tour?.start(); }, []);
  return null;
}
```

### driver.js (lightweight, vanilla)

```bash
npm install driver.js
```

```typescript
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const driverObj = driver({
  showProgress: true,
  steps: [
    { element: '[data-coachmark="panda"]', popover: { title: 'Tap!', description: 'Earn points' } },
    { element: '[data-coachmark="points"]', popover: { title: 'Points', description: 'Track here' } },
  ],
  onDestroyStarted: () => { localStorage.setItem('tour_done', 'true'); driverObj.destroy(); },
});

driverObj.drive();
```

### Choosing a library

| Feature | Custom | react-joyride | shepherd.js | driver.js |
|---------|--------|---------------|-------------|-----------|
| Bundle size | 0 (your code) | ~45KB | ~35KB | ~5KB |
| React-native | Yes | Yes | Wrapper | No |
| Custom styling | Full control | Good | Good | Limited |
| Animations | Framer Motion | Basic | Basic | Basic |
| Accessibility | You build it | Built-in | Built-in | Basic |
| Carousel onboarding | You build it | No | No | No |

Recommendation: Use **custom** when you need carousel onboarding or tight design control (like this project). Use **react-joyride** or **driver.js** for quick spotlight tours on admin/dashboard screens where design flexibility matters less.

## In-context guide overlay

For feature-specific guidance within a screen (not a full tour), use a simple overlay component:

```tsx
function CameraGuideOverlay({ isReady, statusMessage = 'Align food in the frame' }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <div className="mb-8">
        <p className="text-lg font-medium text-white/90 text-center px-6 py-3 rounded-full bg-black/40 backdrop-blur-sm">
          {isReady ? 'Perfect! Take the photo' : statusMessage}
        </p>
      </div>
      {/* Scan frame or visual guide */}
      <div className="w-64 h-64 border-2 border-white/50 rounded-2xl" />
      <p className="mt-8 text-base text-white/80 text-center">
        {isReady ? 'Tap the capture button' : 'Make sure all food is visible'}
      </p>
    </div>
  );
}
```

This pattern is simpler than spotlight tours - it's a persistent overlay on a specific screen that provides contextual instructions without step-by-step navigation.
