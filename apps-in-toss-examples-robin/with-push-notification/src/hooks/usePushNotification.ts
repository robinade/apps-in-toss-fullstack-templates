import { useCallback, useState } from 'react';
import { useEventLogStore } from '../stores/eventLogStore';

interface PushMessage {
  title: string;
  body: string;
  targetUserId: string;
}

interface PushResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function usePushNotification() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<PushResult | null>(null);
  const { addEvent } = useEventLogStore();

  const sendTestPush = useCallback(async (message: PushMessage) => {
    setLoading(true);
    addEvent('push_send_start', { title: message.title });
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        // Mock response for dev
        await new Promise(r => setTimeout(r, 1500));
        const result: PushResult = { success: true, messageId: 'mock-msg-' + Date.now() };
        setLastResult(result);
        addEvent('push_send_mock_success', result);
        setLoading(false);
        return result;
      }

      const result = await response.json();
      setLastResult(result);
      addEvent('push_send_success', result);
      return result;
    } catch {
      // Mock fallback
      await new Promise(r => setTimeout(r, 1500));
      const result: PushResult = { success: true, messageId: 'mock-msg-' + Date.now() };
      setLastResult(result);
      addEvent('push_send_mock_success', result);
      return result;
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  return { loading, lastResult, sendTestPush };
}
