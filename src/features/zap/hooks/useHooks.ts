import { useEffect, useState } from 'react';

import { useApi } from 'soapbox/hooks/useApi.ts';
import { Transactions, WalletData, baseWalletSchema, transactionsSchema } from 'soapbox/schemas/wallet.ts';
import toast from 'soapbox/toast.tsx';

import type { Account as AccountEntity, Status as StatusEntity } from 'soapbox/types/entities.ts';

interface IWalletInfo {
  mints: string[];
  relays: string[];
}

const useWallet = () => {
  const api = useApi();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      const data: WalletData = await response.json();
      if (data) {
        const normalizedData = baseWalletSchema.parse(data);
        setWallet(normalizedData);
      }
    } catch (err) {
      const messageError = err instanceof Error ? err.message : 'Wallet not found';
      if (hasMessage) toast.error(messageError);
      setError(messageError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!wallet) {
      getWallet(false);
    }
  }, [wallet]);

  return { wallet, isLoading, error, createWallet, getWallet };
};

const useTransactions = () => {
  const api = useApi();
  const [transactions, setTransactions] = useState<Transactions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/v1/ditto/cashu/transactions');
      const data: Transactions = await response.json();
      if (data) {
        const normalizedData = transactionsSchema.parse(data);
        setTransactions(normalizedData);
      }
    } catch (err) {
      const messageError = err instanceof Error ? err.message : 'Transactions not found';
      toast.error(messageError);
      setError(messageError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!transactions) {
      getTransactions();
    }
  }, [transactions]);

  return { transactions, isLoading, error, getTransactions };
};

const useNutzapRequest = () => {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutzapsList, setNutzapsList] = useState<Record<string, { status: StatusEntity; amount: number; comment: string }>>({});

  const nutzapRequest = async (account: AccountEntity, amount: number, comment: string, status?: StatusEntity) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/ditto/cashu/nutzap', {
        amount,
        comment,
        account_id: account.id,
        status_id: status?.id,
      });

      const data = await response.json();

      if (status) {
        setNutzapsList((prevState) => ({
          ...prevState,
          [status.id]: { status, amount, comment },
        }));
      }

      toast.success(data.message || 'Nutzap sent successfully!');
    } catch (err) {
      const messageError = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(messageError);
      toast.error(messageError);
    } finally {
      setIsLoading(false);
    }
  };

  return { nutzapsList, isLoading, error, nutzapRequest };
};

export { useWallet, useTransactions, useNutzapRequest };