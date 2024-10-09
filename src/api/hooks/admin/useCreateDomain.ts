import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { domainSchema } from 'soapbox/schemas';

interface CreateDomainParams {
  domain: string;
  public: boolean;
}

const useCreateDomain = () => {
  const api = useApi();

  const { createEntity, ...rest } = useCreateEntity([Entities.DOMAINS], (params: CreateDomainParams) =>
    api.post('/api/v1/pleroma/admin/domains', { json: params }), { schema: domainSchema });

  return {
    createDomain: createEntity,
    ...rest,
  };
};

export { useCreateDomain, type CreateDomainParams };
