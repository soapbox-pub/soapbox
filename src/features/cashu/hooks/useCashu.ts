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

  return {
    createWallet,
    createNutzapInfo,
    swapCashuToWallet,
  };
}

export { useCashu };