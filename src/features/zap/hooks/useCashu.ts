import { produce } from 'immer';
import { create } from 'zustand';

import { MastodonClient } from 'soapbox/api/MastodonClient.ts';
import { WalletData, baseWalletSchema } from 'soapbox/schemas/wallet.ts';
import toast from 'soapbox/toast.tsx';

import type { Account as AccountEntity, Status as StatusEntity } from 'soapbox/types/entities.ts';

interface IWalletInfo {
  mints: string[];
  relays: string[];
}

interface ICashuState {
  nutzapsList: Record<string, { status: StatusEntity; amount: number; comment: string }>;
  isLoading: boolean;
  error: string | null;
  wallet: WalletData | null;

  createWallet: (api: MastodonClient, walletInfo: IWalletInfo) => Promise<void>;
  getWallet: (api: MastodonClient, hasMessage?: boolean) => Promise<void>;
  nutzapRequest: (api: MastodonClient, account: AccountEntity, amount: number, comment: string, status?: StatusEntity) => void;
}

export const useCashu = create<ICashuState>((set) => ({
  nutzapsList: {},
  isLoading: false,
  error: null,
  wallet: null,

  createWallet: async (api, walletInfo) => {
    try {
      const response = await api.put('/api/v1/ditto/cashu/wallet', walletInfo);
      const data = await response.json();
      if (data) {
        const normalizedData = baseWalletSchema.parse(data);
        toast.success('Wallet created successfully'); // TO DO: create translated text
        set({ wallet: normalizedData });
      }
    } catch (e) {
      toast.error('An error has occurred'); // TO DO: create translated text
    }
  },

  getWallet: async (api, hasMessage = true) => {
    try {
      const response = await api.get('/api/v1/ditto/cashu/wallet');
      const data: WalletData = await response.json();
      if (data) {
        const normalizedData = baseWalletSchema.parse(data);
        set({ wallet: normalizedData });
      }
    } catch (error) {
      if (hasMessage) toast.error('Wallet not found');
    }
  },

  nutzapRequest: async (api, account, amount, comment, status) => {
    set((state) => ({ ...state, isLoading: true, error: null }));

    try {
      const response = await api.post('/api/v1/ditto/cashu/nutzap', {
        amount,
        comment,
        account_id: account.id,
        status_id: status?.id,
      });

      const data = await response.json();

      set(produce((state) => {
        if (status) state.nutzapsList[status.id] = { status, amount, comment };
        state.isLoading = false;
      }));

      toast.success(data.message || 'Nutzap sent successfully!');
    } catch (e) {
      set((state) => ({ ...state, isLoading: false, error: e instanceof Error ? e.message : 'An unexpected error occurred' }));
      toast.error(e instanceof Error ? e.message : 'An unexpected error occurred');
    }
  },
}));