import { useAppDispatch, useGetState } from 'soapbox/hooks';

import { deleteEntities, importEntities } from '../actions';

type DeleteFn<T> = (entityId: string) => Promise<T> | T;

interface EntityCallbacks {
  onSuccess?(): void
}

/**
 * Optimistically deletes an entity from the store.
 * This hook should be used to globally delete an entity from all lists.
 * To remove an entity from a single list, see `useDismissEntity`.
 */
function useDeleteEntity<T = unknown>(
  entityType: string,
  deleteFn: DeleteFn<T>,
) {
  const dispatch = useAppDispatch();
  const getState = useGetState();

  return async function deleteEntity(entityId: string, callbacks: EntityCallbacks = {}): Promise<T> {
    // Get the entity before deleting, so we can reverse the action if the API request fails.
    const entity = getState().entities[entityType]?.store[entityId];

    // Optimistically delete the entity from the _store_ but keep the lists in tact.
    dispatch(deleteEntities([entityId], entityType, { preserveLists: true }));

    try {
      const result = await deleteFn(entityId);
      // Success - finish deleting entity from the state.
      dispatch(deleteEntities([entityId], entityType));

      if (callbacks.onSuccess) {
        callbacks.onSuccess();
      }

      return result;
    } catch (e) {
      if (entity) {
        // If the API failed, reimport the entity.
        dispatch(importEntities([entity], entityType));
      }
      throw e;
    }
  };
}

export { useDeleteEntity };