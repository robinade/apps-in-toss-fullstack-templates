import { useCallback, useState } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

interface ShareLinkResult {
  url: string;
  createdAt: number;
}

export function useShareLink() {
  const [link, setLink] = useState<ShareLinkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { addEvent } = useEventLogStore();

  const generateLink = useCallback(async (path: string, params?: Record<string, string>) => {
    setLoading(true);
    addEvent('share_link_generate', { path, params });
    try {
      if (!isTossApp()) {
        await new Promise(r => setTimeout(r, 800));
        const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
        const mockUrl = `https://toss.im/app/mock${path}${queryString}`;
        const result = { url: mockUrl, createdAt: Date.now() };
        setLink(result);
        addEvent('share_link_generated', { url: mockUrl });
        setLoading(false);
        return result;
      }

      const { getTossShareLink } = await import('@apps-in-toss/web-framework') as unknown as {
        getTossShareLink: (url: string, ogImageUrl?: string) => Promise<string>;
      };
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      const deepLink = `intoss://${path}${queryString}`;
      const shareUrl = await getTossShareLink(deepLink);
      const result = { url: shareUrl, createdAt: Date.now() };
      setLink(result);
      addEvent('share_link_generated', { url: shareUrl });
      return result;
    } catch (error) {
      addEvent('share_link_error', { error: String(error) });
      return null;
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const copyToClipboard = useCallback(async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.url);
      addEvent('share_link_copied');
    } catch {
      addEvent('share_link_copy_failed');
    }
  }, [link, addEvent]);

  return { link, loading, generateLink, copyToClipboard };
}
