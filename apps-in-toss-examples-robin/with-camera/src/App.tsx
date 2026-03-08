import { DemoLayout } from './components/DemoLayout';
import { useCamera } from './hooks/useCamera';
import { useEventLogStore } from './stores/eventLogStore';

export default function App() {
  const { imageUri, loading, takePicture, clearImage } = useCamera();
  const { events } = useEventLogStore();

  return (
    <DemoLayout
      title="카메라 촬영"
      description="카메라 촬영 + 이미지 프리뷰"
      statusItems={[
        { label: '상태', value: loading ? '촬영 중' : imageUri ? '촬영 완료' : '대기', variant: imageUri ? 'success' : 'default' },
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        {imageUri ? (
          <div className="space-y-2">
            <img src={imageUri} alt="촬영된 이미지" className="w-full rounded-lg object-cover max-h-64" />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={takePicture} disabled={loading} className="py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50">
                다시 촬영
              </button>
              <button onClick={clearImage} className="py-3 border border-gray-300 rounded-xl text-sm text-gray-700">
                삭제
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={takePicture}
            disabled={loading}
            className="w-full py-12 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 active:bg-gray-200 transition-colors"
          >
            <p className="text-3xl mb-2">📷</p>
            <p className="text-sm font-semibold">{loading ? '촬영 중...' : '터치하여 촬영'}</p>
          </button>
        )}
      </div>
    </DemoLayout>
  );
}
