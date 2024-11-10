import { Entities } from 'soapbox/entity-store/entities.ts';
import { useCreateEntity } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { domainSchema } from 'soapbox/schemas/index.ts';

import type { CreateDomainParams } from './useCreateDomain.ts';

const useUpdateDomain = (id: string) => {
  const api = useApi();

  const { createEntity, ...rest } = useCreateEntity(
    [Entities.DOMAINS],
    (params: Omit<CreateDomainParams, 'domain'>) => api.patch(`/api/v1/pleroma/admin/domains/${id}`, params),
    { schema: domainSchema },
  );

  return {
    updateDomain: createEntity,
    ...rest,
  };
};

export { useUpdateDomain };
