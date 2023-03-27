import { useAppDispatch, useLoading } from 'soapbox/hooks';

import { incrementEntities } from '../actions';

import { parseEntitiesPath } from './utils';

import type { EntityFn, ExpandedEntitiesPath } from './types';

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