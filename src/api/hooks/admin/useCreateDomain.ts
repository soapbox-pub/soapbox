import { Entities } from '@/entity-store/entities.ts';
import { useCreateEntity } from '@/entity-store/hooks/index.ts';
import { useApi } from '@/hooks/useApi.ts';
import { domainSchema } from '@/schemas/index.ts';

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
