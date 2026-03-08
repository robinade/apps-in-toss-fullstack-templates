import { useState, useCallback, useEffect } from 'react';
import { getEnvironment, isTossApp } from '../lib/environment';
import { api } from '../lib/api';
import { useAppStore } from '../stores/appStore';

interface BalanceResponse {
  success: boolean;
  data: { balance: number; totalWithdrawn: number };
}

export function useWithdraw() {
  const [balance, setBalance] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const addEvent = useAppStore((s) => s.addEvent);

  const refreshBalance = useCallback(async () => {
    try {
      const res = await api.get<BalanceResponse>('/api/balance');
      if (res.success) {
        setBalance(res.data.balance);
        setTotalWithdrawn(res.data.totalWithdrawn);
      }
    } catch (error) {
      console.error('[Withdraw] 잔고 조회 실패:', error);
    }
  }, []);

  const withdraw = useCallback(async (amount: number): Promise<{ success: boolean }> => {
    if (amount < 10 || amount > balance) {
      addEvent('withdraw_rejected', { reason: amount < 10 ? 'minimum_10' : 'insufficient' });
      return { success: false };
    }

    setIsWithdrawing(true);
    try {
      if (isTossApp()) {
        // Dynamic import — executePromotion for real toss point withdrawal
        try {
          const { executePromotion } = await import('@apps-in-toss/web-framework');
          addEvent('executePromotion_called', { amount });
          // executePromotion은 서버 사이드에서 처리하므로 여기서는 서버 API 호출
        } catch {
          addEvent('executePromotion_fallback', { reason: 'sdk_error' });
        }
      }

      // 서버에서 잔고 차감
      const res = await api.post<{ success: boolean }>('/api/withdraw', { amount });
      if (res.success) {
        addEvent('withdraw_success', { amount });
        await refreshBalance();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('[Withdraw] 출금 실패:', error);
      addEvent('withdraw_error', { error: String(error) });
      return { success: false };
    } finally {
      setIsWithdrawing(false);
    }
  }, [balance, addEvent, refreshBalance]);

  const canWithdraw = balance >= 10;

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  return { balance, totalWithdrawn, isWithdrawing, canWithdraw, withdraw, refreshBalance };
}
