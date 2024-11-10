import { Entities } from 'soapbox/entity-store/entities.ts';
import { useBatchedEntities } from 'soapbox/entity-store/hooks/useBatchedEntities.ts';
import { useApi, useLoggedIn } from 'soapbox/hooks/index.ts';
import { type GroupRelationship, groupRelationshipSchema } from 'soapbox/schemas/index.ts';

function useGroupRelationships(listKey: string[], ids: string[]) {
  const api = useApi();
  const { isLoggedIn } = useLoggedIn();

  function fetchGroupRelationships(ids: string[]) {
    const q = ids.map((id) => `id[]=${id}`).join('&');
    return api.get(`/api/v1/groups/relationships?${q}`);
  }

  const { entityMap: relationships, ...result } = useBatchedEntities<GroupRelationship>(
    [Entities.RELATIONSHIPS, ...listKey],
    ids,
    fetchGroupRelationships,
    { schema: groupRelationshipSchema, enabled: isLoggedIn },
  );

  return { relationships, ...result };
}

export { useGroupRelationships };