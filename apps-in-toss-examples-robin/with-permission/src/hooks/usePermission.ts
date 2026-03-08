import { useCallback, useState } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

type PermissionType = 'camera' | 'location' | 'contacts';
type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'restricted';

interface PermissionState {
  camera: PermissionStatus;
  location: PermissionStatus;
  contacts: PermissionStatus;
}

export function usePermission() {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: 'unknown',
    location: 'unknown',
    contacts: 'unknown',
  });
  const [loading, setLoading] = useState(false);
  const { addEvent } = useEventLogStore();

  const checkPermission = useCallback(async (type: PermissionType) => {
    addEvent('permission_check', { type });
    try {
      if (!isTossApp()) {
        // Web fallback
        if (type === 'camera' || type === 'location') {
          const name = type === 'camera' ? 'camera' as PermissionName : 'geolocation' as PermissionName;
          const result = await navigator.permissions.query({ name });
          const status: PermissionStatus = result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown';
          setPermissions(prev => ({ ...prev, [type]: status }));
          addEvent('permission_checked_web', { type, status });
          return status;
        }
        setPermissions(prev => ({ ...prev, [type]: 'unknown' }));
        return 'unknown' as PermissionStatus;
      }
      const { getPermission } = await import('@apps-in-toss/web-framework') as unknown as {
        getPermission: {
          (type: string): Promise<{ status: string }>;
          isSupported: () => boolean;
        };
      };
      if (!getPermission.isSupported()) throw new Error('Not supported');
      const result = await getPermission(type);
      const status = result.status as PermissionStatus;
      setPermissions(prev => ({ ...prev, [type]: status }));
      addEvent('permission_checked', { type, status });
      return status;
    } catch (error) {
      addEvent('permission_error', { type, error: String(error) });
      return 'unknown' as PermissionStatus;
    }
  }, [addEvent]);

  const requestPermission = useCallback(async (type: PermissionType) => {
    setLoading(true);
    addEvent('permission_request', { type });
    try {
      if (!isTossApp()) {
        if (type === 'camera') {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(t => t.stop());
          setPermissions(prev => ({ ...prev, camera: 'granted' }));
          addEvent('permission_granted_web', { type });
        } else if (type === 'location') {
          await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
          setPermissions(prev => ({ ...prev, location: 'granted' }));
          addEvent('permission_granted_web', { type });
        } else {
          addEvent('permission_not_available_web', { type });
        }
        setLoading(false);
        return;
      }
      const { openPermissionDialog } = await import('@apps-in-toss/web-framework') as unknown as {
        openPermissionDialog: {
          (type: string): Promise<{ status: string }>;
          isSupported: () => boolean;
        };
      };
      if (!openPermissionDialog.isSupported()) throw new Error('Not supported');
      const result = await openPermissionDialog(type);
      setPermissions(prev => ({ ...prev, [type]: result.status as PermissionStatus }));
      addEvent('permission_result', { type, status: result.status });
    } catch (error) {
      addEvent('permission_error', { type, error: String(error) });
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const checkAll = useCallback(async () => {
    setLoading(true);
    await checkPermission('camera');
    await checkPermission('location');
    await checkPermission('contacts');
    setLoading(false);
  }, [checkPermission]);

  return { permissions, loading, checkPermission, requestPermission, checkAll };
}
