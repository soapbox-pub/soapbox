import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useLoading } from 'soapbox/hooks/useLoading.ts';

import { dismissEntities } from '../actions.ts';

import { parseEntitiesPath } from './utils.ts';

import type { EntityFn, ExpandedEntitiesPath } from './types.ts';

/**
 * Removes an entity from a specific list.
 * To remove an entity globally from all lists, see `useDeleteEntity`.
 */
function useDismissEntity(expandedPath: ExpandedEntitiesPath, entityFn: EntityFn<string>) {
  const dispatch = useAppDispatch();

  const [isLoading, setPromise] = useLoading();
  const { entityType, listKey } = parseEntitiesPath(expandedPath);

  // TODO: optimistic dismissing
  async function dismissEntity(entityId: string) {
    const result = await setPromise(entityFn(entityId));
    dispatch(dismissEntities([entityId], entityType, listKey));
    return result;
  }

  return {
    dismissEntity,
    isLoading,
  };
}

export { useDismissEntity };