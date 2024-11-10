import { Entities } from 'soapbox/entity-store/entities.ts';
import { useCreateEntity } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { domainSchema } from 'soapbox/schemas/index.ts';

interface CreateDomainParams {
  domain: string;
  public: boolean;
}

const useCreateDomain = () => {
  const api = useApi();

  const { createEntity, ...rest } = useCreateEntity(
    [Entities.DOMAINS],
    (params: CreateDomainParams) => api.post('/api/v1/pleroma/admin/domains', params),
    { schema: domainSchema },
  );

  return {
    createDomain: createEntity,
    ...rest,
  };
};

export { useCreateDomain, type CreateDomainParams };
