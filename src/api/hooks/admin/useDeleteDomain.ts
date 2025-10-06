import { Entities } from '@/entity-store/entities.ts';
import { useDeleteEntity } from '@/entity-store/hooks/index.ts';
import { useApi } from '@/hooks/useApi.ts';

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
