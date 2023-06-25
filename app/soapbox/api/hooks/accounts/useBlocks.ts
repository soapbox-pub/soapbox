import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi, useLoggedIn } from 'soapbox/hooks';
import { Account, accountSchema } from 'soapbox/schemas';

import { useRelationships } from './useRelationships';

function useBlocks(type: 'blocks' | 'mutes' = 'blocks') {
  const api = useApi();
  const { isLoggedIn } = useLoggedIn();

  const { entities, ...rest } = useEntities(
    [Entities.ACCOUNTS, type],
    () => api.get(`/api/v1/${type}`),
    { schema: accountSchema, enabled: isLoggedIn },
  );

  const { relationships } = useRelationships(
    [type],
    entities.map(({ id }) => id),
  );

  const accounts: Account[] = entities.map((account) => ({
    ...account,
    relationship: relationships[account.id],
  }));

  return { accounts, ...rest };
}

export { useBlocks };