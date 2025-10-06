import { Entities } from '@/entity-store/entities.ts';
import { useEntities } from '@/entity-store/hooks/index.ts';
import { useApi } from '@/hooks/useApi.ts';
import { useFeatures } from '@/hooks/useFeatures.ts';
import { Status as StatusEntity, statusSchema } from '@/schemas/index.ts';

/**
 * Get all the statuses the user has bookmarked.
 * https://docs.joinmastodon.org/methods/bookmarks/#get
 * GET /api/v1/bookmarks
 * TODO: add 'limit'
 */
function useBookmarks() {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<StatusEntity>(
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