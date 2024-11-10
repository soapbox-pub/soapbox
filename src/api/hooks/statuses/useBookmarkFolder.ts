import { Entities } from 'soapbox/entity-store/entities.ts';
import { selectEntity } from 'soapbox/entity-store/selectors.ts';
import { useAppSelector } from 'soapbox/hooks/index.ts';
import { type BookmarkFolder } from 'soapbox/schemas/bookmark-folder.ts';

import { useBookmarkFolders } from './useBookmarkFolders.ts';

function useBookmarkFolder(folderId?: string) {
  const {
    isError,
    isFetched,
    isFetching,
    isLoading,
    invalidate,
  } = useBookmarkFolders();

  const bookmarkFolder = useAppSelector(state => folderId
    ? selectEntity<BookmarkFolder>(state, Entities.BOOKMARK_FOLDERS, folderId)
    : undefined);

  return {
    bookmarkFolder,
    isError,
    isFetched,
    isFetching,
    isLoading,
    invalidate,
  };
}

export { useBookmarkFolder };
