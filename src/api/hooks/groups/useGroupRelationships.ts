import { Entities } from '@/entity-store/entities.ts';
import { useBatchedEntities } from '@/entity-store/hooks/useBatchedEntities.ts';
import { useApi } from '@/hooks/useApi.ts';
import { useLoggedIn } from '@/hooks/useLoggedIn.ts';
import { type GroupRelationship, groupRelationshipSchema } from '@/schemas/index.ts';

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