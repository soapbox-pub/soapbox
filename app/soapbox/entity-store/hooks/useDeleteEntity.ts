import { useApi, useAppDispatch, useGetState } from 'soapbox/hooks';

import { deleteEntities, importEntities } from '../actions';

import { toAxiosRequest } from './utils';

import type { EntityRequest } from './types';

interface DeleteEntityCallbacks {
  onSuccess?(): void
  onError?(): void
}

/**
 * Optimistically deletes an entity from the store.
 * This hook should be used to globally delete an entity from all lists.
 * To remove an entity from a single list, see `useDismissEntity`.
 */
function useDeleteEntity(
  entityType: string,
  request: EntityRequest,
) {
  const api = useApi();
  const dispatch = useAppDispatch();
  const getState = useGetState();

  return async function deleteEntity(entityId: string, callbacks: DeleteEntityCallbacks = {}): Promise<void> {
    // Get the entity before deleting, so we can reverse the action if the API request fails.
    const entity = getState().entities[entityType]?.store[entityId];

    // Optimistically delete the entity from the _store_ but keep the lists in tact.
    dispatch(deleteEntities([entityId], entityType, { preserveLists: true }));

    try {
      // HACK: replace occurrences of `:id` in the URL. Maybe there's a better way?
      const axiosReq = toAxiosRequest(request);
      axiosReq.url?.replaceAll(':id', entityId);

      await api.request(axiosReq);

      // Success - finish deleting entity from the state.
      dispatch(deleteEntities([entityId], entityType));

      if (callbacks.onSuccess) {
        callbacks.onSuccess();
      }
    } catch (e) {
      if (entity) {
        // If the API failed, reimport the entity.
        dispatch(importEntities([entity], entityType));
      }

      if (callbacks.onError) {
        callbacks.onError();
      }
    }
  };
}

export { useDeleteEntity };