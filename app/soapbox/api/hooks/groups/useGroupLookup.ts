import { Entities } from 'soapbox/entity-store/entities';
import { useEntityLookup } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { groupSchema } from 'soapbox/schemas';

function useGroupLookup(slug: string) {
  const api = useApi();

  return useEntityLookup(
    Entities.GROUPS,
    (group) => group.slug === slug,
    () => api.get(`/api/v1/groups/lookup?name=${slug}`),
    { schema: groupSchema },
  );
}

export { useGroupLookup };