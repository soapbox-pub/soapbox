import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { bookmarkFolderSchema } from 'soapbox/schemas/bookmark-folder';

interface UpdateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

function useUpdateBookmarkFolder(folderId: string) {
  const api = useApi();

  const { createEntity, ...rest } = useCreateEntity(
    [Entities.BOOKMARK_FOLDERS],
    (params: UpdateBookmarkFolderParams) =>
      api.patch(`/api/v1/pleroma/bookmark_folders/${folderId}`, params, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    { schema: bookmarkFolderSchema },
  );

  return {
    updateBookmarkFolder: createEntity,
    ...rest,
  };
}

export { useUpdateBookmarkFolder };
