import { useAppDispatch } from 'soapbox/hooks';

import { dismissEntities } from '../actions';

import { parseEntitiesPath } from './utils';

import type { ExpandedEntitiesPath } from './types';

type DismissFn<T> = (entityId: string) => Promise<T> | T;

/**
 * Removes an entity from a specific list.
 * To remove an entity globally from all lists, see `useDeleteEntity`.
 */
function useDismissEntity<T = unknown>(expandedPath: ExpandedEntitiesPath, dismissFn: DismissFn<T>) {
  const path = parseEntitiesPath(expandedPath);
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