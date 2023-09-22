import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntityLookup } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { useFeatures } from 'soapbox/hooks/useFeatures';
import { groupSchema } from 'soapbox/schemas';

import { useGroupRelationship } from './useGroupRelationship';

function useGroupLookup(slug: string) {
  const api = useApi();
  const features = useFeatures();
  const history = useHistory();

  const { entity: group, isUnauthorized, ...result } = useEntityLookup(
    Entities.GROUPS,
    (group) => group.slug.toLowerCase() === slug.toLowerCase(),
    () => api.get(`/api/v1/groups/lookup?name=${slug}`),
    { schema: groupSchema, enabled: features.groups && !!slug },
  );

  const { groupRelationship: relationship } = useGroupRelationship(group?.id);

  useEffect(() => {
    if (isUnauthorized) {
      history.push('/login');
    }
  }, [isUnauthorized]);

  return {
    ...result,
    isUnauthorized,
    entity: group ? { ...group, relationship: relationship || null } : undefined,
  };
}

export { useGroupLookup };