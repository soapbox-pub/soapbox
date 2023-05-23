import { useRelationship } from 'soapbox/api/hooks';
import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { accountSchema } from 'soapbox/schemas';

export const useAccount = (accountId: string, refetch = false) => {
  const api = useApi();

  const { entity: account, ...result } = useEntity(
    [Entities.ACCOUNTS, accountId],
    () => api.get(`/api/v1/accounts/${accountId}`),
    { schema: accountSchema, refetch, enabled: !!accountId },
  );
  const { relationship } = useRelationship(accountId);

  return {
    ...result,
    account,
    relationship,
  };
};
