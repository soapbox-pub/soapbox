import { useMutation, useQuery } from '@tanstack/react-query';

import { DittoInstanceCredentials } from 'soapbox/features/admin/manage-ditto-server.tsx';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { queryClient } from 'soapbox/queries/client.ts';
import { instanceV2Schema } from 'soapbox/schemas/instance.ts';

function useManageDittoServer() {
  const api = useApi();

  const getDittoInstance = async () => {
    const response = await api.get('/api/v2/instance');
    const data: DittoInstanceCredentials = await response.json();

    const instance = instanceV2Schema.parse(data);
    return {
      title: instance.title,
      description: instance.description,
      short_description: instance.short_description,
      screenshots: instance.screenshots,
      thumbnail: instance.thumbnail,
    };
  };

  const result = useQuery<Readonly<DittoInstanceCredentials>>({
    queryKey: ['DittoInstance'],
    queryFn: getDittoInstance,
  });


  const { mutate: updateDittoInstance } = useMutation({
    mutationFn: (data: DittoInstanceCredentials) => api.put('/api/v1/admin/ditto/instance', data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['DittoInstance'] });
    },
  });

  return {
    ...result,
    updateDittoInstance,
  };
}

export { useManageDittoServer };