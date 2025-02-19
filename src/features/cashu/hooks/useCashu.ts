import { useMutation } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks/useApi.ts';
import { queryClient } from 'soapbox/queries/client.ts';

function useCashu() {
  const api = useApi();

  const { mutate: createWallet } = useMutation({
    mutationFn: (data: {mints: string[]}) => api.post('/api/v1/ditto/wallet/create', data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['cashu', 'create', 'wallet'] });
    },
  });

  const { mutate: createNutzapInfo } = useMutation({
    mutationFn: (data: {mints: string[]; relays: string[]}) => api.post('/api/v1/ditto/nutzap_information/create', data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['cashu', 'nutzap', 'info'] });
    },
  });

  const { mutate: swapCashuToWallet } = useMutation({
    mutationFn: () => api.post('/api/v1/ditto/nutzap/swap_to_wallet'),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['cashu', 'swap', 'wallet'] });
    },
  });

  const { mutate: createQuote } = useMutation({
    mutationFn: (data: {mint: string; amount: number}) => api.post('/api/v1/ditto/cashu/quote', data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['cashu', 'nutzap', 'info'] });
    },
  });

  const { mutate: getQuoteState } = useMutation({
    mutationFn: (quote_id: string) => api.get(`/api/v1/ditto/cashu/quote/${quote_id}`),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['cashu', 'nutzap', 'info'] });
    },
  });

  const { mutate: getWallet } = useMutation({
    mutationFn: () => api.get('/api/v1/ditto/cashu/wallet'),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['cashu', 'nutzap', 'info'] });
    },
  });

  const { mutate: mintTheMint } = useMutation({
    mutationFn: (quote_id: string) => api.post(`/api/v1/ditto/cashu/mint/${quote_id}`),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['cashu', 'nutzap', 'info'] });
    },
  });

  return {
    getWallet,
    mintTheMint,
    getQuoteState,
    createQuote,
    createWallet,
    createNutzapInfo,
    swapCashuToWallet,
  };
}

export { useCashu };