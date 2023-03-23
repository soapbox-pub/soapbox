import { useAppDispatch, useGetState } from 'soapbox/hooks';

import { deleteEntities, importEntities } from '../actions';

import { useEntityRequest } from './useEntityRequest';
import { toAxiosRequest } from './utils';

import type { EntityCallbacks, EntityRequest } from './types';

/**
 * Optimistically deletes an entity from the store.
 * This hook should be used to globally delete an entity from all lists.
 * To remove an entity from a single list, see `useDismissEntity`.
 */
function useDeleteEntity(
  entityType: string,
  entityRequest: EntityRequest,
) {
  const dispatch = useAppDispatch();
  const getState = useGetState();
  const { request, isLoading } = useEntityRequest();

  async function deleteEntity(entityId: string, callbacks: EntityCallbacks<string> = {}): Promise<void> {
    // Get the entity before deleting, so we can reverse the action if the API request fails.
    const entity = getState().entities[entityType]?.store[entityId];

    // Optimistically delete the entity from the _store_ but keep the lists in tact.
    dispatch(deleteEntities([entityId], entityType, { preserveLists: true }));

    try {
      // HACK: replace occurrences of `:id` in the URL. Maybe there's a better way?
      const axiosReq = toAxiosRequest(entityRequest);
      axiosReq.url?.replaceAll(':id', entityId);

      await request(axiosReq);

      // Success - finish deleting entity from the state.
      dispatch(deleteEntities([entityId], entityType));

      if (callbacks.onSuccess) {
        callbacks.onSuccess(entityId);
      }
    } catch (e) {
      if (entity) {
        // If the API failed, reimport the entity.
        dispatch(importEntities([entity], entityType));
      }

      if (callbacks.onError) {
        callbacks.onError(e);
      }
    }
  }

  return {
    deleteEntity,
    isLoading,
  };
}

export { useDeleteEntity };