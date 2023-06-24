import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useLoggedIn } from 'soapbox/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { type Relationship, relationshipSchema } from 'soapbox/schemas';

function useRelationships(ids: string[]) {
  const api = useApi();
  const { isLoggedIn } = useLoggedIn();
  const q = ids.map(id => `id[]=${id}`).join('&');

  const { entities: relationships, ...result } = useEntities<Relationship>(
    [Entities.RELATIONSHIPS, q],
    () => api.get(`/api/v1/accounts/relationships?${q}`),
    { schema: relationshipSchema, enabled: isLoggedIn && ids.filter(Boolean).length > 0 },
  );

  return {
    ...result,
    relationships,
  };
}

export { useRelationships };