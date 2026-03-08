import { useRef, useEffect, useState } from 'react';
import { useBannerAd } from '../hooks/useBannerAd';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';
import { cn } from '../lib/utils';

interface BannerAdProps {
  adGroupId: string;
  type: 'fixed' | 'inline';
  className?: string;
}

export function BannerAd({ adGroupId, type, className }: BannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isInitialized, attachBanner } = useBannerAd();
  const { addEvent } = useEventLogStore();
  const [mockVisible, setMockVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!isTossApp()) {
      // Mock banner for web dev
      setTimeout(() => setMockVisible(true), 500);
      addEvent('mock_banner_rendered', { adGroupId, type });
      return;
    }

    if (!isInitialized) return;

    const cleanup = attachBanner(adGroupId, containerRef.current, {
      onAdRendered: () => addEvent('banner_rendered', { adGroupId }),
      onAdViewable: () => addEvent('banner_viewable', { adGroupId }),
      onAdClicked: () => addEvent('banner_clicked', { adGroupId }),
      onNoFill: () => addEvent('banner_no_fill', { adGroupId }),
      onError: (error) => addEvent('banner_error', { adGroupId, error: String(error) }),
    });

    return () => { if (typeof cleanup === 'function') cleanup(); };
  }, [isInitialized, adGroupId, attachBanner, addEvent, type]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'overflow-hidden rounded-lg',
        type === 'fixed' && 'h-24',
        className,
      )}
    >
      {!isTossApp() && mockVisible && (
        <div className={cn(
          'w-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center',
          type === 'fixed' ? 'h-24' : 'h-auto py-8',
        )}>
          <div className="text-center">
            <p className="text-xs font-semibold text-indigo-600">Mock Banner Ad</p>
            <p className="text-[10px] text-gray-400">{adGroupId}</p>
            <p className="text-[10px] text-gray-400">{type}</p>
          </div>
        </div>
      )}
    </div>
  );
}
