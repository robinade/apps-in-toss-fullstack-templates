/**
 * Cross-Promotion Bottom Sheet Template
 *
 * Copy and adapt this component for any Apps-in-Toss mini-app.
 * Uses vaul Drawer (shadcn/ui). If @toss/tds-mobile is installed,
 * replace Drawer with useBottomSheet from TDS.
 *
 * Prerequisites:
 *   - vaul package installed
 *   - Drawer component at @/components/ui/drawer
 *   - @apps-in-toss/web-framework for openURL
 */

import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

// ─── Configuration ───────────────────────────────────────
// Edit this array to add/remove promoted apps.
// Find appName in the Apps-in-Toss developer console.

interface PromoItem {
  emoji: string;       // Emoji or replace with <img src="..."> for app icon
  bgColor: string;     // TDS color token (blue50, green50, orange50, etc.)
  title: string;       // Korean CTA in 해요체
  subtitle: string;    // English app name or short description
  scheme: string;      // intoss://{appName}/ or intoss://{appName}/{path}
}

const PROMO_ITEMS: PromoItem[] = [
  {
    emoji: '🌤️',
    bgColor: '#e8f3ff',       // blue50
    title: '날씨 확인하고 포인트 받기',
    subtitle: 'Check Weather',
    scheme: 'intoss://weather-check/',
  },
  {
    emoji: '🐼',
    bgColor: '#e8f8ef',       // green50
    title: '판다 밥 주고 용돈 모으기',
    subtitle: 'Raise Your Panda',
    scheme: 'intoss://healthy-habit/',
  },
  // Add more apps here:
  // {
  //   emoji: '🎮',
  //   bgColor: '#fff3e0',    // orange50
  //   title: '게임하고 포인트 받기',
  //   subtitle: 'Play Games',
  //   scheme: 'intoss://my-game/',
  // },
];

// ─── Component ───────────────────────────────────────────

interface CrossPromoBannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CrossPromoBanner: React.FC<CrossPromoBannerProps> = ({ open, onOpenChange }) => {
  const handleNavigate = async (scheme: string) => {
    try {
      const { openURL } = await import('@apps-in-toss/web-framework');
      openURL(scheme);
    } catch {
      // Web dev environment fallback
      window.location.href = scheme;
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="rounded-t-2xl border-0" style={{ maxHeight: '45vh' }}>
        <DrawerHeader className="pb-1 pt-2">
          <DrawerTitle
            className="text-left"
            style={{ fontSize: '17px', fontWeight: 700, color: '#191f28', letterSpacing: '-0.02em' }}
          >
            오늘 포인트 더 모으기
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-2.5 px-4 pb-6">
          {PROMO_ITEMS.map((item) => (
            <button
              key={item.scheme}
              onClick={() => handleNavigate(item.scheme)}
              className="flex items-center gap-3 w-full text-left transition-colors active:scale-[0.98]"
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: '#ffffff',
              }}
            >
              {/* Icon */}
              <div
                className="flex-shrink-0 flex items-center justify-center"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: item.bgColor,
                  fontSize: '20px',
                }}
              >
                {item.emoji}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#191f28', lineHeight: 1.4 }}>
                  {item.title}
                </p>
                <p style={{ fontSize: '13px', fontWeight: 400, color: '#9ca3af', lineHeight: 1.4 }}>
                  {item.subtitle}
                </p>
              </div>

              {/* Chevron */}
              <svg
                className="flex-shrink-0"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CrossPromoBanner;

// ─── Integration Example ─────────────────────────────────
//
// In your result/completion view:
//
// const [showCrossPromo, setShowCrossPromo] = useState(false);
//
// useEffect(() => {
//   if (!triggerCondition) return;  // e.g., rewardClaimed, gameComplete
//   const timer = setTimeout(() => setShowCrossPromo(true), 1200);
//   return () => clearTimeout(timer);
// }, [triggerCondition]);
//
// return (
//   <div>
//     {/* ...your existing UI... */}
//     <CrossPromoBanner open={showCrossPromo} onOpenChange={setShowCrossPromo} />
//   </div>
// );
