import { useAppDispatch } from 'soapbox/hooks';

import { incrementEntities } from '../actions';

import { parseEntitiesPath } from './utils';

import type { ExpandedEntitiesPath } from './types';

type IncrementFn<T> = (entityId: string) => Promise<T> | T;

/**
 * Increases (or decreases) the `totalCount` in the entity list by the specified amount.
 * This only works if the API returns an `X-Total-Count` header and your components read it.
 */
function useIncrementEntity<T = unknown>(
  expandedPath: ExpandedEntitiesPath,
  diff: number,
  incrementFn: IncrementFn<T>,
) {
  const { entityType, listKey } = parseEntitiesPath(expandedPath);
  const dispatch = useAppDispatch();

  return async function incrementEntity(entityId: string): Promise<void> {
    dispatch(incrementEntities(entityType, listKey, diff));
    try {
      await incrementFn(entityId);
    } catch (e) {
      dispatch(incrementEntities(entityType, listKey, diff * -1));
    }
  };
}

export { useIncrementEntity };