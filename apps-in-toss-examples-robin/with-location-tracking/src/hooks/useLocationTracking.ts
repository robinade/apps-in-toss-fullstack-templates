import { useCallback, useRef, useState } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

interface LocationPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export function useLocationTracking() {
  const [tracking, setTracking] = useState(false);
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  const { addEvent } = useEventLogStore();

  const startTracking = useCallback(async () => {
    setError(null);
    addEvent('tracking_start');
    try {
      if (!isTossApp()) {
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            const point: LocationPoint = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              timestamp: pos.timestamp,
            };
            setPoints(prev => [point, ...prev].slice(0, 100));
            addEvent('tracking_point', { lat: point.latitude.toFixed(4), lng: point.longitude.toFixed(4) });
          },
          (err) => {
            setError(err.message);
            addEvent('tracking_error', { error: err.message });
          },
          { enableHighAccuracy: true }
        );
        watchIdRef.current = id;
        setTracking(true);
        return;
      }
      const { startUpdateLocation } = await import('@apps-in-toss/web-framework') as unknown as {
        startUpdateLocation: {
          (opts: { onEvent: (event: { coords: { latitude: number; longitude: number; accuracy: number }; timestamp: number }) => void; onError?: (error: unknown) => void }): () => void;
          isSupported: () => boolean;
        };
      };
      if (!startUpdateLocation.isSupported()) throw new Error('Not supported');
      const cleanup = startUpdateLocation({
        onEvent: (pos) => {
          const point: LocationPoint = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp };
          setPoints(prev => [point, ...prev].slice(0, 100));
          addEvent('tracking_point', { lat: point.latitude.toFixed(4), lng: point.longitude.toFixed(4) });
        },
        onError: (err: unknown) => {
          setError(String(err));
          addEvent('tracking_error', { error: String(err) });
        },
      });
      cleanupRef.current = cleanup;
      setTracking(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      addEvent('tracking_start_error', { error: String(err) });
    }
  }, [addEvent]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    cleanupRef.current?.();
    cleanupRef.current = undefined;
    setTracking(false);
    addEvent('tracking_stop', { totalPoints: points.length });
  }, [addEvent, points.length]);

  const clearHistory = useCallback(() => {
    setPoints([]);
    addEvent('tracking_history_cleared');
  }, [addEvent]);

  return { tracking, points, error, startTracking, stopTracking, clearHistory };
}
