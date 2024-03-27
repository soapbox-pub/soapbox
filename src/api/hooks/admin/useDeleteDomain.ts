import { Entities } from 'soapbox/entity-store/entities';
import { useDeleteEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';

interface DeleteDomainParams {
  domain: string;
  public: boolean;
}

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

export { useDeleteDomain, type DeleteDomainParams };
