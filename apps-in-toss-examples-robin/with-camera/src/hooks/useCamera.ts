import { useCallback, useState } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

export function useCamera() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { addEvent } = useEventLogStore();

  const takePicture = useCallback(async () => {
    setLoading(true);
    addEvent('camera_capture_start');
    try {
      if (!isTossApp()) {
        // Web fallback: file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        const file = await new Promise<File | null>((resolve) => {
          input.onchange = () => resolve(input.files?.[0] ?? null);
          input.click();
        });
        if (file) {
          const url = URL.createObjectURL(file);
          setImageUri(url);
          addEvent('camera_capture_web', { name: file.name, size: file.size });
        } else {
          addEvent('camera_cancelled');
        }
        setLoading(false);
        return;
      }
      const { openCamera } = await import('@apps-in-toss/web-framework') as unknown as {
        openCamera: { (): Promise<{ uri: string }>; isSupported: () => boolean };
      };
      if (!openCamera.isSupported()) throw new Error('Not supported');
      const result = await openCamera();
      setImageUri(result.uri);
      addEvent('camera_capture_success');
    } catch (error) {
      addEvent('camera_error', { error: String(error) });
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const clearImage = useCallback(() => {
    if (imageUri) URL.revokeObjectURL(imageUri);
    setImageUri(null);
    addEvent('camera_clear');
  }, [imageUri, addEvent]);

  return { imageUri, loading, takePicture, clearImage };
}
