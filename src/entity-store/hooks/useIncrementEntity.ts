import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useLoading } from 'soapbox/hooks/useLoading.ts';

import { incrementEntities } from '../actions.ts';

import { parseEntitiesPath } from './utils.ts';

import type { EntityFn, ExpandedEntitiesPath } from './types.ts';

/**
 * Increases (or decreases) the `totalCount` in the entity list by the specified amount.
 * This only works if the API returns an `X-Total-Count` header and your components read it.
 */
function useIncrementEntity(
  expandedPath: ExpandedEntitiesPath,
  diff: number,
  entityFn: EntityFn<string>,
) {
  const dispatch = useAppDispatch();
  const [isLoading, setPromise] = useLoading();
  const { entityType, listKey } = parseEntitiesPath(expandedPath);

  async function incrementEntity(entityId: string): Promise<void> {
    dispatch(incrementEntities(entityType, listKey, diff));
    try {
      await setPromise(entityFn(entityId));
    } catch (e) {
      dispatch(incrementEntities(entityType, listKey, diff * -1));
    }
  }

  return {
    incrementEntity,
    isLoading,
  };
}

export { useIncrementEntity };