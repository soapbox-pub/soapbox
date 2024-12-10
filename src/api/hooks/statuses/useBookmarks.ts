import { EntityTypes, Entities } from 'soapbox/entity-store/entities.ts';
import { useEntities } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { statusSchema } from 'soapbox/schemas/status.ts';

function useBookmarks() {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<EntityTypes[Entities.STATUSES]>(
    [Entities.STATUSES, 'bookmarks'],
    () => api.get('/api/v1/bookmarks'),
    { enabled: features.bookmarks, schema: statusSchema },
  );

  const bookmarks = entities;

  return {
    ...result,
    bookmarks,
  };
}

export { useBookmarks };