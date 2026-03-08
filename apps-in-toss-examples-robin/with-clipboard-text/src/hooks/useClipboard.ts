import { useCallback, useState } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

export function useClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { addEvent } = useEventLogStore();

  const setText = useCallback(async (text: string) => {
    setLoading(true);
    addEvent('clipboard_copy', { text: text.slice(0, 30) });
    try {
      if (!isTossApp()) {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);
        addEvent('clipboard_copy_success');
        setLoading(false);
        return;
      }
      const { setClipboardText } = await import('@apps-in-toss/web-framework') as unknown as {
        setClipboardText: { (text: string): Promise<void>; isSupported: () => boolean };
      };
      if (!setClipboardText.isSupported()) throw new Error('Not supported');
      await setClipboardText(text);
      setCopiedText(text);
      addEvent('clipboard_copy_success');
    } catch (error) {
      addEvent('clipboard_error', { op: 'copy', error: String(error) });
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const getText = useCallback(async () => {
    setLoading(true);
    addEvent('clipboard_paste');
    try {
      let text: string;
      if (!isTossApp()) {
        text = await navigator.clipboard.readText();
      } else {
        const { getClipboardText } = await import('@apps-in-toss/web-framework') as unknown as {
          getClipboardText: { (): Promise<string>; isSupported: () => boolean };
        };
        if (!getClipboardText.isSupported()) throw new Error('Not supported');
        text = await getClipboardText();
      }
      setPastedText(text);
      addEvent('clipboard_paste_success', { text: text.slice(0, 30) });
      return text;
    } catch (error) {
      addEvent('clipboard_error', { op: 'paste', error: String(error) });
      return null;
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  return { copiedText, pastedText, loading, setText, getText };
}
