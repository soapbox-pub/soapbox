import { enableMapSet } from 'immer';
import { create } from 'zustand';

enableMapSet();

interface IPaymentMethod {
  method: 'cashu' | 'lightning';
  changeMethod: (method: 'cashu' | 'lightning') => void;
}

export const usePaymentMethod = create<IPaymentMethod>(
  (set) => ({
    method: localStorage.getItem('soapbox:payment_method') as 'cashu' | 'lightning' || 'cashu',
    changeMethod: (method: 'cashu' | 'lightning') => {
      localStorage.setItem('soapbox:payment_method', method);
      set({ method });
    },
  }),
);