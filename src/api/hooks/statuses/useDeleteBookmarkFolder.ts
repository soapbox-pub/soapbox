import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntityActions } from 'soapbox/entity-store/hooks/index.ts';

function useDeleteBookmarkFolder() {
  const { deleteEntity, isSubmitting } = useEntityActions(
    [Entities.BOOKMARK_FOLDERS],
    { delete: '/api/v1/pleroma/bookmark_folders/:id' },
  );

  return {
    deleteBookmarkFolder: deleteEntity,
    isSubmitting,
  };
}

export { useDeleteBookmarkFolder };
