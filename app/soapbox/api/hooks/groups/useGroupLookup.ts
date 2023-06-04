import { Entities } from 'soapbox/entity-store/entities';
import { useEntityLookup } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { groupSchema } from 'soapbox/schemas';

import { useGroupRelationship } from './useGroupRelationship';

function useGroupLookup(slug: string) {
  const api = useApi();

  const { entity: group, ...result } = useEntityLookup(
    Entities.GROUPS,
    (group) => group.slug === slug,
    () => api.get(`/api/v1/groups/lookup?name=${slug}`),
    { schema: groupSchema, enabled: !!slug },
  );

  const { entity: relationship } = useGroupRelationship(group?.id);

  return {
    ...result,
    entity: group ? { ...group, relationship: relationship || null } : undefined,
  };
}

export { useGroupLookup };