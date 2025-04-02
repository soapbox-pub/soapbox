import { debounce } from 'es-toolkit';
import { useEffect, useState } from 'react';
import { create } from 'zustand';

import { useApi } from 'soapbox/hooks/useApi.ts';
import { NutzappedEntry, NutzappedRecord, Transactions, WalletData, baseWalletSchema, nutzappedEntry, transactionsSchema } from 'soapbox/schemas/wallet.ts';
import toast from 'soapbox/toast.tsx';

import type { Account as AccountEntity, Status as StatusEntity } from 'soapbox/types/entities.ts';

interface WalletState {
  wallet: WalletData | null;
  acceptsZapsCashu: boolean;
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
  setAcceptsZapsCashu: (acceptsZapsCashu: boolean) => void;
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
  setAcceptsZapsCashu: (acceptsZapsCashu) => set({ acceptsZapsCashu }),
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

const useWallet = () => {
  const api = useApi();
  const { wallet, setWallet, setAcceptsZapsCashu, hasFetchedWallet, setHasFetchedWallet } = useWalletStore();
  const [isLoading, setIsLoading] = useState(!hasFetchedWallet);
  const [error, setError] = useState<string | null>(null);

  const createWallet = async (walletInfo: IWalletInfo) => {
    setIsLoading(true);
    try {
      const response = await api.put('/api/v1/ditto/cashu/wallet', walletInfo);
      const data = await response.json();
      if (data) {
        const normalizedData = baseWalletSchema.parse(data);
        toast.success('Wallet created successfully');
        setWallet(normalizedData);
      }
    } catch (err) {
      const messageError = err instanceof Error ? err.message : 'An error has occurred';
      setError(messageError);
      toast.error(messageError);
    } finally {
      setIsLoading(false);
    }
  };

  const getWallet = async (hasMessage = true) => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/v1/ditto/cashu/wallet');
      const data = await response.json();
      if (data) {
        const normalizedData = baseWalletSchema.parse(data);
        setAcceptsZapsCashu(true);

        setWallet(normalizedData);
      }
    } catch (err) {
      const messageError = err instanceof Error ? err.message : 'Wallet not found';
      if (hasMessage) toast.error(messageError);
      setError(messageError);
    } finally {
      setIsLoading(false);
      setHasFetchedWallet(true);
    }
  };

  useEffect(() => {
    if (!hasFetchedWallet) {
      getWallet(false);
    }
  }, []);

  return { wallet, isLoading, error, createWallet, getWallet };
};

const useTransactions = () => {
  const api = useApi();
  const { transactions, nextTransaction, setTransactions, hasFetchedTransactions, setHasFetchedTransactions } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/v1/ditto/cashu/transactions');
      const { prev, next } = response.pagination();
      const data = await response.json();
      if (data) {
        const normalizedData = transactionsSchema.parse(data);
        setTransactions(normalizedData, prev, next);
      }
    } catch (err) {
      const messageError = err instanceof Error ? err.message : 'Transactions not found';
      toast.error(messageError);
      setError(messageError);
    } finally {
      setIsLoading(false);
    }
  };

  const expandTransactions = async () => {
    if (!nextTransaction || !transactions) {
      return false;
    }
    try {
      setIsLoading(true);
      const response = await api.get(nextTransaction);
      const { prev, next } = response.pagination();
      const data = await response.json();

      const normalizedData = transactionsSchema.parse(data);
      const newTransactions = [...(transactions ?? []), ...normalizedData ];

      setTransactions(newTransactions, prev, next);
      return true;
    } catch (err) {
      const messageError = err instanceof Error ? err.message : 'Error expanding transactions';
      toast.error(messageError);
      setError(messageError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedTransactions) {
      setHasFetchedTransactions(true);
      getTransactions();
    }
  }, []);

  return { transactions, isLoading, error, getTransactions, expandTransactions };
};

const useZapCashuRequest = () => {
  const api = useApi();
  const { zapCashuList, addZapCashu } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getWallet } = useWallet();
  const { getTransactions } = useTransactions();

  const zapCashuRequest = async (account: AccountEntity, amount: number, comment: string, status?: StatusEntity) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/api/v1/ditto/cashu/nutzap', {
        amount,
        comment,
        account_id: account.id,
        status_id: status?.id,
      });

      if (status) {
        addZapCashu(status.id);
      }

      toast.success('Sats sent successfully!');
      getWallet();
      getTransactions();
    } catch (err) {
      const messageError = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(messageError);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { zapCashuList, isLoading, error, zapCashuRequest };
};

const useZappedByCashu = () => {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { nextZaps, nutzappedRecord, setNutzappedRecord } = useWalletStore();

  const getNutzappedBy = async (statusId: string) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/v1/ditto/cashu/statuses/${statusId}/nutzapped_by`);
      const { prev, next } = response.pagination();
      const data = await response.json();
      if (data) {
        const normalizedData = nutzappedEntry.parse(data);
        setNutzappedRecord(statusId, normalizedData, prev, next);
      }
    } catch (err) {
      const messageError = err instanceof Error ? err.message : 'Zaps not found';
      toast.error('Zaps not foud');
      setError(messageError);
    } finally {
      setIsLoading(false);
    }
  };

  const expandNutzappedBy = debounce(async (id: string) => {
    if (!nextZaps || !nutzappedRecord[id]) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get(nextZaps);
      const { prev, next } = response.pagination();
      const data = await response.json();
      if (data) {
        const normalizedData = nutzappedEntry.parse(data);
        const newNutzappedBy = [...(nutzappedRecord[id] ?? []), ...normalizedData ];

        setNutzappedRecord(id, newNutzappedBy, prev, next);
      }
    } catch (err) {
      const messageError = err instanceof Error ? err.message : 'Error expanding transactions';
      toast.error(messageError);
      setError(messageError);
    } finally {
      setIsLoading(false);
    }
  }, 700);

  return { error, isLoading, getNutzappedBy, expandNutzappedBy };
};

export { useWalletStore, useWallet, useTransactions, useZapCashuRequest, useZappedByCashu };