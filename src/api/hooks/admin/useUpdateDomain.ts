import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { domainSchema } from 'soapbox/schemas';

import type { CreateDomainParams } from './useCreateDomain';

const useUpdateDomain = (id: string) => {
  const api = useApi();

  const { createEntity, ...rest } = useCreateEntity([Entities.DOMAINS], (params: Omit<CreateDomainParams, 'domain'>) =>
    api.patch(`/api/v1/pleroma/admin/domains/${id}`, params), { schema: domainSchema });

  return {
    updateDomain: createEntity,
    ...rest,
  };
};

export { useUpdateDomain };
