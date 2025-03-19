import { produce } from 'immer';
import { create } from 'zustand';

import { MastodonClient } from 'soapbox/api/MastodonClient.ts';
import toast from 'soapbox/toast.tsx';

import type { Account as AccountEntity, Status as StatusEntity } from 'soapbox/types/entities.ts';

interface NutzapState {
  nutzapsList: Record<string, { status: StatusEntity; amount: number; comment: string }>;

  nutzapRequest: (api: MastodonClient, account: AccountEntity, amount: number, comment: string, status?: StatusEntity) => void;
}

export const useNutzap = create<NutzapState>((set) => ({
  nutzapsList: {},

  nutzapRequest: async (api, account, amount, comment, status) => {
    set(produce((state) => {
      state.isLoading = true; state.error = null;
    }));

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
      }));

      toast.success(data.message || 'Nutzap sent successfully!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'An unexpected error occurred');
    }
  },
}));