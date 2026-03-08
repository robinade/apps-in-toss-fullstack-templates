import { useCallback, useState } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export function useLocationOnce() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addEvent } = useEventLogStore();

  const getCurrentPosition = useCallback(async () => {
    setLoading(true);
    setError(null);
    addEvent('location_request');
    try {
      if (!isTossApp()) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
        });
        const data: LocationData = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        };
        setLocation(data);
        addEvent('location_success', { lat: data.latitude.toFixed(4), lng: data.longitude.toFixed(4) });
        setLoading(false);
        return data;
      }
      const { getCurrentLocation } = await import('@apps-in-toss/web-framework') as unknown as {
        getCurrentLocation: {
          (opts?: { enableHighAccuracy?: boolean }): Promise<{ coords: { latitude: number; longitude: number; accuracy: number }; timestamp: number }>;
          isSupported: () => boolean;
        };
      };
      if (!getCurrentLocation.isSupported()) throw new Error('Not supported');
      const pos = await getCurrentLocation({ enableHighAccuracy: true });
      const data: LocationData = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      };
      setLocation(data);
      addEvent('location_success', { lat: data.latitude.toFixed(4), lng: data.longitude.toFixed(4) });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      addEvent('location_error', { error: message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  return { location, loading, error, getCurrentPosition };
}
