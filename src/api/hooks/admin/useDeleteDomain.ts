import { Entities } from 'soapbox/entity-store/entities.ts';
import { useDeleteEntity } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';

const useDeleteDomain = () => {
  const api = useApi();

  const { deleteEntity, ...rest } = useDeleteEntity(Entities.DOMAINS, (id: string) =>
    api.delete(`/api/v1/pleroma/admin/domains/${id}`, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }));

  return {
    mutate: deleteEntity,
    ...rest,
  };
};

export { useDeleteDomain };
