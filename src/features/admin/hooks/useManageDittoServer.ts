import { useMutation } from '@tanstack/react-query';

import { DittoInstanceCredentials } from 'soapbox/features/admin/manage-ditto-server.tsx';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { queryClient } from 'soapbox/queries/client.ts';

function useManageDittoServer() {
  const api = useApi();

  const { mutate: updateDittoInstance } = useMutation({
    mutationFn: (data: DittoInstanceCredentials) => api.put('/api/v1/admin/ditto/instance', data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['instance', api.baseUrl, 'v2'] });
    },
  });

  return {
    updateDittoInstance,
  };
}

export { useManageDittoServer };