import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { type Relationship, relationshipSchema } from 'soapbox/schemas';

function useRelationships(ids: string[]) {
  const api = useApi();

  const { entities: relationships, ...result } = useEntities<Relationship>(
    [Entities.RELATIONSHIPS],
    () => api.get(`/api/v1/accounts/relationships?${ids.map(id => `id[]=${id}`).join('&')}`),
    { schema: relationshipSchema, enabled: ids.filter(Boolean).length > 0 },
  );

  return {
    ...result,
    relationships,
  };
}

export { useRelationships };