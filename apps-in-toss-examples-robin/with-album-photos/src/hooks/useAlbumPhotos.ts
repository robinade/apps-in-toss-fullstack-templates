import { useCallback, useState } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

interface PhotoItem {
  uri: string;
  id: string;
}

export function useAlbumPhotos() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { addEvent } = useEventLogStore();

  const selectPhotos = useCallback(async (maxCount = 5) => {
    setLoading(true);
    addEvent('album_select_start', { maxCount });
    try {
      if (!isTossApp()) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        const files = await new Promise<FileList | null>((resolve) => {
          input.onchange = () => resolve(input.files);
          input.click();
        });
        if (files && files.length > 0) {
          const selected: PhotoItem[] = Array.from(files).slice(0, maxCount).map((f, i) => ({
            uri: URL.createObjectURL(f),
            id: `web-${i}-${Date.now()}`,
          }));
          setPhotos(prev => [...prev, ...selected]);
          addEvent('album_selected_web', { count: selected.length });
        } else {
          addEvent('album_cancelled');
        }
        setLoading(false);
        return;
      }
      const { fetchAlbumPhotos } = await import('@apps-in-toss/web-framework') as unknown as {
        fetchAlbumPhotos: { (opts: { maxCount: number }): Promise<{ photos: Array<{ uri: string }> }>; isSupported: () => boolean };
      };
      if (!fetchAlbumPhotos.isSupported()) throw new Error('Not supported');
      const result = await fetchAlbumPhotos({ maxCount });
      const selected: PhotoItem[] = result.photos.map((p, i) => ({ uri: p.uri, id: `album-${i}-${Date.now()}` }));
      setPhotos(prev => [...prev, ...selected]);
      addEvent('album_selected', { count: selected.length });
    } catch (error) {
      addEvent('album_error', { error: String(error) });
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const removePhoto = useCallback((id: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo && photo.uri.startsWith('blob:')) URL.revokeObjectURL(photo.uri);
      return prev.filter(p => p.id !== id);
    });
    addEvent('album_photo_removed', { id });
  }, [addEvent]);

  const clearAll = useCallback(() => {
    photos.forEach(p => { if (p.uri.startsWith('blob:')) URL.revokeObjectURL(p.uri); });
    setPhotos([]);
    addEvent('album_cleared');
  }, [photos, addEvent]);

  return { photos, loading, selectPhotos, removePhoto, clearAll };
}
