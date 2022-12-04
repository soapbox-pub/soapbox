import type { Entity } from './types';

const ENTITIES_IMPORT = 'ENTITIES_IMPORT';

/** Action to import entities into the cache. */
function importEntities(entities: Entity[], entityType: string, listKey?: string) {
  return {
    type: ENTITIES_IMPORT,
    entityType,
    entities,
    listKey,
  };
}

/** Any action pertaining to entities. */
type EntityAction = ReturnType<typeof importEntities>;

export {
  ENTITIES_IMPORT,
  importEntities,
  EntityAction,
};