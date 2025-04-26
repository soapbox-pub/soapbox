import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { defineMessages, useIntl } from 'react-intl';
import { create } from 'zustand';

import { useApi } from 'soapbox/hooks/useApi.ts';
import { NutzappedEntry, NutzappedRecord, Transactions, WalletData, baseWalletSchema, nutzappedEntry, transactionsSchema } from 'soapbox/schemas/wallet.ts';
import toast from 'soapbox/toast.tsx';

import type { Account as AccountEntity, Status as StatusEntity } from 'soapbox/types/entities.ts';

const messages = defineMessages({
  createWallet: { id: 'wallet.create.success', defaultMessage: 'Wallet created successfully!' },
  success: { id: 'wallet.success', defaultMessage: 'Data updated with success!' },
  error: { id: 'wallet.error', defaultMessage: 'Failed to update.' },
});

interface WalletState {
  wallet: WalletData | null;
  transactions: Transactions | null;
  zapCashuList: string[];
  nutzappedRecord: NutzappedRecord;
  prevTransaction?: string | null;
  nextTransaction?: string | null;
  prevZaps?: string | null;
  nextZaps?: string | null;
  hasFetchedWallet: boolean;
  hasFetchedTransactions: boolean;

  setNutzappedRecord: (statusId: string, nutzappedEntry: NutzappedEntry, prevZaps?: string | null, nextZaps?: string | null) => void;
  setWallet: (wallet: WalletData | null) => void;
  setHasFetchedWallet: (hasFetchedWallet: boolean) => void;
  setTransactions: (transactions: Transactions | null, prevTransaction?: string | null, nextTransaction?: string | null) => void;
  setHasFetchedTransactions: (hasFetched: boolean) => void;
  addZapCashu: (statusId: string) => void;
}

interface IWalletInfo {
  mints: string[];
  relays: string[];
}

interface IZapCashuPayload {
  account: AccountEntity;
  amount: number;
  comment: string;
  status?: StatusEntity;
}

const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  acceptsZapsCashu: false,
  transactions: null,
  prevTransaction: null,
  nextTransaction: null,
  prevZaps: null,
  nextZaps: null,
  zapCashuList: [],
  nutzappedRecord: {},
  hasFetchedWallet: false,
  hasFetchedTransactions: false,

  setNutzappedRecord: (statusId, nutzappedEntry, prevZaps, nextZaps) => set((state)=> ({
    nutzappedRecord: {
      ...state.nutzappedRecord,
      [statusId]: nutzappedEntry,
    },
    prevZaps,
    nextZaps,
  })),
  setWallet: (wallet) => set({ wallet }),
  setHasFetchedWallet: (hasFetchedWallet) => set({ hasFetchedWallet }),
  setTransactions: (transactions, prevTransaction, nextTransaction) => set({ transactions, prevTransaction, nextTransaction }),
  setHasFetchedTransactions: (hasFetched) => set({ hasFetchedTransactions: hasFetched }),
  addZapCashu: (statusId) =>
    set((state) => ({
      zapCashuList: [
        ...state.zapCashuList,
        statusId,
      ],
    })),
}));

const useCreateWallet = () => {
  const api = useApi();
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { setWallet } = useWalletStore();

  const createWallet = useMutation({
    mutationFn: async (walletInfo: IWalletInfo) => {
      const response = await api.put('/api/v1/ditto/cashu/wallet', walletInfo);
      const data = await response.json();
      return baseWalletSchema.parse(data);
    },
    onSuccess: (data) => {
      toast.success(intl.formatMessage(messages.createWallet));
      setWallet(data);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'An error occurred while creating the wallet');
    },
  });

  return { createWallet: createWallet.mutateAsync };
};

const useWallet = () => {
  const api = useApi();
  const {
    setWallet,
    setHasFetchedWallet,
  } = useWalletStore();

  const getWallet = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const response = await api.get('/api/v1/ditto/cashu/wallet');
      const data = await response.json();
      const normalizedData = baseWalletSchema.parse(data);

      setWallet(normalizedData);
      setHasFetchedWallet(true);

      return normalizedData;
    },
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  return {
    walletData: getWallet.data,
    error: getWallet.error?.message,
    isLoading: getWallet.isLoading,
    getWallet: getWallet.refetch,
  };
};

const useTransactions = () => {
  const api = useApi();
  const { setTransactions } = useWalletStore();

  const getTransactions = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await api.get('/api/v1/ditto/cashu/transactions');
      const { prev, next: nextPag } = response.pagination();
      const data = await response.json();
      const normalizedData = transactionsSchema.parse(data);

      setTransactions(normalizedData, prev, nextPag);
      return normalizedData;
    },
  });

  const expandTransactions = useMutation({
    mutationFn: async () => {
      const { transactions, nextTransaction } = useWalletStore.getState();

      if (!nextTransaction || !transactions) {
        return;
      }

      const response = await api.get(nextTransaction);
      const { prev, next: nextPag } = response.pagination();
      const data = await response.json();

      const normalizedData = transactionsSchema.parse(data);
      const newTransactions = [...transactions, ...normalizedData];

      setTransactions(newTransactions, prev, nextPag);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error expanding transactions');
    },
  });

  return {
    transactions: getTransactions.data,
    isLoading: getTransactions.isLoading,
    error: getTransactions.error,
    refetch: getTransactions.refetch,
    expandTransactions: expandTransactions.mutateAsync,
    isExpanding: expandTransactions.isPending,
  };
};

const useZapCashuRequest = () => {
  const api = useApi();
  const { addZapCashu } = useWalletStore();
  const { refetch } = useTransactions();
  const queryClient = useQueryClient();

  const zapCashuRequest = useMutation({
    mutationFn: async ({ account, amount, comment, status }: IZapCashuPayload) => {
      await api.post('/api/v1/ditto/cashu/nutzap', {
        amount,
        comment,
        account_id: account.id,
        status_id: status?.id,
      });

      if (status) {
        addZapCashu(status.id);
      }
    },
    onSuccess: async () =>{
      toast.success('Sats sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      await refetch();
    },
    onError: (err: unknown) => {
      const messageError = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.error(messageError);
    },
  });

  return { zapCashu: zapCashuRequest.mutateAsync, isLoading: zapCashuRequest.isPending };
};

const useZappedByCashu = (statusId: string) => {
  const api = useApi();
  const { nextZaps, nutzappedRecord, setNutzappedRecord } = useWalletStore();

  const getNutzappedBy = useQuery({
    queryKey: ['nutzappedBy', statusId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/ditto/cashu/statuses/${statusId}/nutzapped_by`);
      const { prev, next } = response.pagination();
      const data = await response.json();
      const normalizedData = nutzappedEntry.parse(data);
      setNutzappedRecord(statusId, normalizedData, prev, next);
      return normalizedData;
    },
    enabled: !!statusId,
    retry: false,
    staleTime: 1000 * 60 * 2,
  });

  const expandNutzappedBy = useMutation({
    mutationFn: async () => {
      if (!nextZaps || !nutzappedRecord[statusId]) {
        throw new Error('No more zaps to load');
      }

      const response = await api.get(nextZaps);
      const { prev, next } = response.pagination();
      const data = await response.json();
      const normalizedData = nutzappedEntry.parse(data);
      const newNutzappedBy = [...(nutzappedRecord[statusId] ?? []), ...normalizedData];
      setNutzappedRecord(statusId, newNutzappedBy, prev, next);
      return newNutzappedBy;
    },
    onError: (err: unknown) => {
      const messageError = err instanceof Error ? err.message : 'Error expanding zaps';
      toast.error(messageError);
    },
  });

  return {
    error: getNutzappedBy.error,
    isLoading: getNutzappedBy.isLoading || expandNutzappedBy.isPending,
    getNutzappedBy: getNutzappedBy.refetch,
    expandNutzappedBy: expandNutzappedBy.mutateAsync,
  };
};

const useUpdateWallet = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  const intl = useIntl();

  const updateWallet = useMutation({
    mutationFn: async ({ mints, relays }: IWalletInfo) => {
      await api.put('/api/v1/ditto/cashu/wallet', { mints: mints, relays: relays });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success(intl.formatMessage(messages.success));
    },
    onError: (err: Error) => {
      const errorMessage = err instanceof Error ? err.message : intl.formatMessage(messages.error);
      toast.error(errorMessage);
      console.error(err);
    },
  });

  return {
    updateWallet: updateWallet.mutateAsync,
    isSuccess: updateWallet.isSuccess,
    error: updateWallet.error,
    isLoading: updateWallet.isPending,
  };

};

export { useWalletStore, useWallet, useCreateWallet, useTransactions, useZapCashuRequest, useZappedByCashu, useUpdateWallet };