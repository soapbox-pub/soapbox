import { enableMapSet } from 'immer';
import { create } from 'zustand';

enableMapSet();

interface IPaymentMethod {
  method: 'cashu' | 'zap';
  changeMethod: (method: 'cashu' | 'zap') => void;
}

export const usePaymentMethod = create<IPaymentMethod>(
  (set) => ({
    method: localStorage.getItem('soapbox:payment_method') as 'cashu' | 'zap' || 'cashu',
    changeMethod: (method: 'cashu' | 'zap') => {
      localStorage.setItem('soapbox:payment_method', method);
      set({ method });
    },
  }),
);