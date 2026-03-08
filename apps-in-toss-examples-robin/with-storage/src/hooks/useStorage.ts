import { useCallback, useState } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

interface StorageItem {
  key: string;
  value: string;
}

type StorageSDK = {
  setItem: { (key: string, value: string): Promise<void>; isSupported: () => boolean };
  getItem: { (key: string): Promise<string | null>; isSupported: () => boolean };
  removeItem: { (key: string): Promise<void>; isSupported: () => boolean };
  clearItems: { (): Promise<void>; isSupported: () => boolean };
};

let _storage: StorageSDK | null = null;
async function getStorage(): Promise<StorageSDK> {
  if (_storage) return _storage;
  const { Storage } = await import('@apps-in-toss/web-framework') as unknown as { Storage: StorageSDK };
  _storage = Storage;
  return _storage;
}

export function useStorage() {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { addEvent } = useEventLogStore();

  const setItem = useCallback(async (key: string, value: string) => {
    setLoading(true);
    addEvent('storage_set', { key, value: value.slice(0, 50) });
    try {
      if (!isTossApp()) {
        localStorage.setItem(`ait_${key}`, value);
        setItems(prev => {
          const existing = prev.findIndex(i => i.key === key);
          if (existing >= 0) {
            const next = [...prev];
            next[existing] = { key, value };
            return next;
          }
          return [...prev, { key, value }];
        });
        addEvent('storage_set_success', { key });
        setLoading(false);
        return;
      }
      const Storage = await getStorage();
      if (!Storage.setItem.isSupported()) throw new Error('Not supported');
      await Storage.setItem(key, value);
      setItems(prev => {
        const existing = prev.findIndex(i => i.key === key);
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = { key, value };
          return next;
        }
        return [...prev, { key, value }];
      });
      addEvent('storage_set_success', { key });
    } catch (error) {
      addEvent('storage_error', { op: 'set', error: String(error) });
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const getItem = useCallback(async (key: string): Promise<string | null> => {
    setLoading(true);
    addEvent('storage_get', { key });
    try {
      if (!isTossApp()) {
        const value = localStorage.getItem(`ait_${key}`);
        addEvent('storage_get_result', { key, found: value !== null });
        setLoading(false);
        return value;
      }
      const Storage = await getStorage();
      if (!Storage.getItem.isSupported()) throw new Error('Not supported');
      const value = await Storage.getItem(key);
      addEvent('storage_get_result', { key, found: value !== null });
      setLoading(false);
      return value;
    } catch (error) {
      addEvent('storage_error', { op: 'get', error: String(error) });
      setLoading(false);
      return null;
    }
  }, [addEvent]);

  const removeItem = useCallback(async (key: string) => {
    setLoading(true);
    addEvent('storage_remove', { key });
    try {
      if (!isTossApp()) {
        localStorage.removeItem(`ait_${key}`);
      } else {
        const Storage = await getStorage();
        if (!Storage.removeItem.isSupported()) throw new Error('Not supported');
        await Storage.removeItem(key);
      }
      setItems(prev => prev.filter(i => i.key !== key));
      addEvent('storage_remove_success', { key });
    } catch (error) {
      addEvent('storage_error', { op: 'remove', error: String(error) });
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const clearAll = useCallback(async () => {
    setLoading(true);
    addEvent('storage_clear');
    try {
      if (!isTossApp()) {
        const keys = items.map(i => i.key);
        keys.forEach(k => localStorage.removeItem(`ait_${k}`));
      } else {
        const Storage = await getStorage();
        if (!Storage.clearItems.isSupported()) throw new Error('Not supported');
        await Storage.clearItems();
      }
      setItems([]);
      addEvent('storage_clear_success');
    } catch (error) {
      addEvent('storage_error', { op: 'clear', error: String(error) });
    } finally {
      setLoading(false);
    }
  }, [addEvent, items]);

  return { items, loading, setItem, getItem, removeItem, clearAll };
}
