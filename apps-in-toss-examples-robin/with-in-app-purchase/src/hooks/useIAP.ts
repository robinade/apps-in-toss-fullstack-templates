import { useCallback, useState } from 'react';
import { isTossApp } from '../lib/environment';
import { useEventLogStore } from '../stores/eventLogStore';

interface ProductItem {
  productId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
}

interface PurchaseResult {
  orderId: string;
  productId: string;
  purchaseTime: number;
}

export function useIAP() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<PurchaseResult | null>(null);
  const { addEvent } = useEventLogStore();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    addEvent('iap_fetch_products');
    try {
      if (!isTossApp()) {
        await new Promise(r => setTimeout(r, 1000));
        const mockProducts: ProductItem[] = [
          { productId: 'gem_100', title: '보석 100개', description: '게임에서 사용할 보석', price: 1100, currency: 'KRW' },
          { productId: 'gem_500', title: '보석 500개', description: '보석 대량 팩', price: 4900, currency: 'KRW' },
          { productId: 'premium', title: '프리미엄 구독', description: '광고 제거 + 보너스', price: 9900, currency: 'KRW' },
        ];
        setProducts(mockProducts);
        addEvent('iap_products_loaded', { count: mockProducts.length });
        setLoading(false);
        return;
      }

      const sdk = await import('@apps-in-toss/web-framework');
      const getProductItemList = (sdk as unknown as { getProductItemList: { (opts: { options: { productIds: string[] } }): Promise<{ productItems: ProductItem[] }>; isSupported: () => boolean } }).getProductItemList;
      if (!getProductItemList.isSupported()) throw new Error('Not supported');

      const result = await getProductItemList({
        options: { productIds: ['gem_100', 'gem_500', 'premium'] },
      });
      setProducts(result.productItems);
      addEvent('iap_products_loaded', { count: result.productItems.length });
    } catch (error) {
      addEvent('iap_error', { op: 'fetch', error: String(error) });
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  const purchase = useCallback(async (productId: string) => {
    setLoading(true);
    addEvent('iap_purchase_start', { productId });
    try {
      if (!isTossApp()) {
        await new Promise(r => setTimeout(r, 2000));
        const result: PurchaseResult = {
          orderId: 'mock-order-' + Date.now(),
          productId,
          purchaseTime: Date.now(),
        };
        setLastPurchase(result);
        addEvent('iap_purchase_success', result);
        setLoading(false);
        return result;
      }

      const sdk = await import('@apps-in-toss/web-framework');
      const createOneTimePurchaseOrder = (sdk as unknown as { createOneTimePurchaseOrder: { (opts: { options: { productId: string } }): Promise<PurchaseResult>; isSupported: () => boolean } }).createOneTimePurchaseOrder;
      if (!createOneTimePurchaseOrder.isSupported()) throw new Error('Not supported');

      const result = await createOneTimePurchaseOrder({ options: { productId } });
      setLastPurchase(result);
      addEvent('iap_purchase_success', result);
      return result;
    } catch (error) {
      addEvent('iap_error', { op: 'purchase', error: String(error) });
      return null;
    } finally {
      setLoading(false);
    }
  }, [addEvent]);

  return { products, loading, lastPurchase, fetchProducts, purchase };
}
