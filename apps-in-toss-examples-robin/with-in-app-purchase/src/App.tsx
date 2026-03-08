import { DemoLayout } from './components/DemoLayout';
import { useIAP } from './hooks/useIAP';
import { useEventLogStore } from './stores/eventLogStore';
import { useEffect } from 'react';

export default function App() {
  const { products, loading, lastPurchase, fetchProducts, purchase } = useIAP();
  const { events } = useEventLogStore();

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <DemoLayout
      title="인앱 결제"
      description="상품 목록 조회 + 1회성 구매 예제"
      statusItems={[
        { label: '상품 수', value: `${products.length}개` },
        { label: '상태', value: loading ? '처리 중' : '대기' },
        ...(lastPurchase ? [{ label: '마지막 구매', value: lastPurchase.productId, variant: 'success' as const }] : []),
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        {products.length === 0 && !loading && (
          <button onClick={fetchProducts} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm">
            상품 목록 불러오기
          </button>
        )}

        {products.map(product => (
          <div key={product.productId} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold">{product.title}</p>
              <p className="text-xs text-gray-500">{product.description}</p>
            </div>
            <button
              onClick={() => purchase(product.productId)}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              {product.price.toLocaleString()}원
            </button>
          </div>
        ))}

        {lastPurchase && (
          <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
            구매 완료: {lastPurchase.productId} (주문: {lastPurchase.orderId.slice(0, 15)}...)
          </div>
        )}
      </div>
    </DemoLayout>
  );
}
