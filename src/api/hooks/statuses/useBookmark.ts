import { importEntities } from 'soapbox/entity-store/actions.ts';
import { Entities } from 'soapbox/entity-store/entities.ts';
import { useTransaction } from 'soapbox/entity-store/hooks/index.ts';
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

  async function bookmark(statusId: string) {
    if (!isLoggedIn) return;
    bookmarkEffect(statusId);

    try {
      const response = await api.post(`/api/v1/statuses/${statusId}/bookmark`);
      const result = statusSchema.safeParse(await response.json());
      if (result.success) {
        dispatch(importEntities([result.data], Entities.STATUSES, 'bookmarks'));
      }
    } catch (e) {
      unbookmarkEffect(statusId);
    }
  }

  async function unbookmark(statusId: string) {
    if (!isLoggedIn) return;
    unbookmarkEffect(statusId);

    try {
      await api.post(`/api/v1/statuses/${statusId}/unbookmark`);
    } catch (e) {
      bookmarkEffect(statusId);
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