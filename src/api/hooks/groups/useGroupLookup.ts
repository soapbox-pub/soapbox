import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { Entities } from '@/entity-store/entities.ts';
import { useEntityLookup } from '@/entity-store/hooks/index.ts';
import { useApi } from '@/hooks/useApi.ts';
import { useFeatures } from '@/hooks/useFeatures.ts';
import { groupSchema } from '@/schemas/index.ts';

import { useGroupRelationship } from './useGroupRelationship.ts';

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