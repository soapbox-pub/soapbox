import { Entities } from 'soapbox/entity-store/entities';
import { useEntityActions } from 'soapbox/entity-store/hooks';

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
