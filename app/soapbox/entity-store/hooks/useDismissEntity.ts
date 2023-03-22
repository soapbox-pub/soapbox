import { useAppDispatch } from 'soapbox/hooks';

import { dismissEntities } from '../actions';

type EntityPath = [entityType: string, listKey: string]
type DismissFn<T> = (entityId: string) => Promise<T> | T;

/**
 * Removes an entity from a specific list.
 * To remove an entity globally from all lists, see `useDeleteEntity`.
 */
function useDismissEntity<T = unknown>(path: EntityPath, dismissFn: DismissFn<T>) {
  const [entityType, listKey] = path;
  const dispatch = useAppDispatch();

  // TODO: optimistic dismissing
  return async function dismissEntity(entityId: string): Promise<T> {
    const result = await dismissFn(entityId);
    dispatch(dismissEntities([entityId], entityType, listKey));
    return result;
  };
}

export { useDismissEntity };