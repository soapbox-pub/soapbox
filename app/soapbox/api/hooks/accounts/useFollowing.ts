import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { Account, accountSchema } from 'soapbox/schemas';

import { useRelationships } from './useRelationships';

function useFollowing(accountId: string | undefined, type: 'followers' | 'following') {
  const api = useApi();

  const { entities, ...rest } = useEntities(
    [Entities.ACCOUNTS, accountId!, type],
    () => api.get(`/api/v1/accounts/${accountId}/${type}`),
    { schema: accountSchema, enabled: !!accountId },
  );

  const { relationships } = useRelationships(
    [accountId!, type],
    entities.map(({ id }) => id),
  );

  const accounts: Account[] = entities.map((account) => ({
    ...account,
    relationship: relationships[account.id],
  }));

  return { accounts, ...rest };
}

export { useFollowing };