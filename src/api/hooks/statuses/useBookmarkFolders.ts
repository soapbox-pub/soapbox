import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { useFeatures } from 'soapbox/hooks/useFeatures';
import { bookmarkFolderSchema, type BookmarkFolder } from 'soapbox/schemas/bookmark-folder';

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
