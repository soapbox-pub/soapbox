import { Entities } from 'soapbox/entity-store/entities.ts';
import { useCreateEntity } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/index.ts';
import { bookmarkFolderSchema } from 'soapbox/schemas/bookmark-folder.ts';

interface UpdateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

function useUpdateBookmarkFolder(folderId: string) {
  const api = useApi();

  const { createEntity, ...rest } = useCreateEntity(
    [Entities.BOOKMARK_FOLDERS],
    (params: UpdateBookmarkFolderParams) => api.patch(`/api/v1/pleroma/bookmark_folders/${folderId}`, params),
    { schema: bookmarkFolderSchema },
  );

  return {
    updateBookmarkFolder: createEntity,
    ...rest,
  };
}

export { useUpdateBookmarkFolder };
