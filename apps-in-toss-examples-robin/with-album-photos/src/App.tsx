import { DemoLayout } from './components/DemoLayout';
import { useAlbumPhotos } from './hooks/useAlbumPhotos';
import { useEventLogStore } from './stores/eventLogStore';

export default function App() {
  const { photos, loading, selectPhotos, removePhoto, clearAll } = useAlbumPhotos();
  const { events } = useEventLogStore();

  return (
    <DemoLayout
      title="앨범 사진"
      description="앨범에서 다중 이미지 선택 예제"
      statusItems={[
        { label: '선택된 사진', value: `${photos.length}장` },
        { label: '상태', value: loading ? '선택 중' : '대기' },
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map(photo => (
              <div key={photo.id} className="relative aspect-square">
                <img src={photo.uri} alt="" className="w-full h-full object-cover rounded-lg" />
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => selectPhotos(5)}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? '선택 중...' : '사진 선택 (최대 5장)'}
        </button>

        {photos.length > 0 && (
          <button onClick={clearAll} className="w-full py-2 border border-red-300 text-red-600 rounded-xl text-sm">
            전체 삭제
          </button>
        )}
      </div>
    </DemoLayout>
  );
}
