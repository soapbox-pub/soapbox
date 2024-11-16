import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntities } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { bookmarkFolderSchema, type BookmarkFolder } from 'soapbox/schemas/bookmark-folder.ts';

function useBookmarkFolders() {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<BookmarkFolder>(
    [Entities.BOOKMARK_FOLDERS],
    () => api.get('/api/v1/pleroma/bookmark_folders'),
    { enabled: features.bookmarkFolders, schema: bookmarkFolderSchema },
  );

  const bookmarkFolders = entities;

  return {
    ...result,
    bookmarkFolders,
  };
}

export { useBookmarkFolders };
