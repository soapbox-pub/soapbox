import { Entities } from 'soapbox/entity-store/entities.ts';
import { useCreateEntity } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/index.ts';
import { bookmarkFolderSchema } from 'soapbox/schemas/bookmark-folder.ts';

interface CreateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

function useCreateBookmarkFolder() {
  const api = useApi();

  const { createEntity, ...rest } = useCreateEntity(
    [Entities.BOOKMARK_FOLDERS],
    (params: CreateBookmarkFolderParams) =>
      api.post('/api/v1/pleroma/bookmark_folders', params, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    { schema: bookmarkFolderSchema },
  );

  return {
    createBookmarkFolder: createEntity,
    ...rest,
  };
}

export { useCreateBookmarkFolder };
