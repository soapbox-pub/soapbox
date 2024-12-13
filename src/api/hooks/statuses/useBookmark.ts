import { importEntities } from 'soapbox/entity-store/actions.ts';
import { Entities } from 'soapbox/entity-store/entities.ts';
import { useDismissEntity, useTransaction } from 'soapbox/entity-store/hooks/index.ts';
import { ExpandedEntitiesPath } from 'soapbox/entity-store/hooks/types.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useLoggedIn } from 'soapbox/hooks/useLoggedIn.ts';
import { statusSchema } from 'soapbox/schemas/index.ts';

/**
 * Bookmark and undo a bookmark, with optimistic update.
 *
 * https://docs.joinmastodon.org/methods/statuses/#bookmark
 * POST /api/v1/statuses/:id/bookmark
 *
 * https://docs.joinmastodon.org/methods/statuses/#unbookmark
 * POST /api/v1/statuses/:id/unbookmark
 */
function useBookmark() {
  const api = useApi();
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useLoggedIn();
  const { transaction } = useTransaction();

  type Success = { success: boolean }

  const path: ExpandedEntitiesPath = [Entities.STATUSES, 'bookmarks'];

  const { dismissEntity } = useDismissEntity(path, async (statusId: string) => {
    const response = await api.post(`/api/v1/statuses/${statusId}/unbookmark`);
    return response;
  });

  function bookmarkEffect(statusId: string) {
    transaction({
      Statuses: {
        [statusId]: (status) => ({
          ...status,
          bookmarked: true,
        }),
      },
    });
  }

  function unbookmarkEffect(statusId: string) {
    transaction({
      Statuses: {
        [statusId]: (status) => ({
          ...status,
          bookmarked: false,
        }),
      },
    });
  }

  async function bookmark(statusId: string): Promise<Success> {
    if (!isLoggedIn) return { success: false };
    bookmarkEffect(statusId);

    try {
      const response = await api.post(`/api/v1/statuses/${statusId}/bookmark`);
      const result = statusSchema.safeParse(await response.json());
      if (result.success) {
        dispatch(importEntities([result.data], Entities.STATUSES, 'bookmarks'));
      }
      return { success: true };
    } catch (e) {
      unbookmarkEffect(statusId);
      return { success: false };
    }
  }

  async function unbookmark(statusId: string): Promise<Success> {
    if (!isLoggedIn) return { success: false };
    unbookmarkEffect(statusId);

    try {
      await dismissEntity(statusId);
      return { success: true };
    } catch (e) {
      bookmarkEffect(statusId);
      return { success: false };
    }
  }

  return {
    bookmark,
    unbookmark,
    bookmarkEffect,
    unbookmarkEffect,
  };
}

export { useBookmark };