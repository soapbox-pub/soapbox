import type { Entity, EntityListState } from './types';

const ENTITIES_IMPORT = 'ENTITIES_IMPORT' as const;
const ENTITIES_DELETE = 'ENTITIES_DELETE' as const;
const ENTITIES_FETCH_REQUEST = 'ENTITIES_FETCH_REQUEST' as const;
const ENTITIES_FETCH_SUCCESS = 'ENTITIES_FETCH_SUCCESS' as const;
const ENTITIES_FETCH_FAIL = 'ENTITIES_FETCH_FAIL' as const;

/** Action to import entities into the cache. */
function importEntities(entities: Entity[], entityType: string, listKey?: string) {
  return {
    type: ENTITIES_IMPORT,
    entityType,
    entities,
    listKey,
  };
}

interface DeleteEntitiesOpts {
  preserveLists?: boolean
}

function deleteEntities(ids: Iterable<string>, entityType: string, opts: DeleteEntitiesOpts = {}) {
  return {
    type: ENTITIES_DELETE,
    ids,
    entityType,
    opts,
  };
}

function entitiesFetchRequest(entityType: string, listKey?: string) {
  return {
    type: ENTITIES_FETCH_REQUEST,
    entityType,
    listKey,
  };
}

function entitiesFetchSuccess(entities: Entity[], entityType: string, listKey?: string, newState?: EntityListState) {
  return {
    type: ENTITIES_FETCH_SUCCESS,
    entityType,
    entities,
    listKey,
    newState,
  };
}

function entitiesFetchFail(entityType: string, listKey: string | undefined, error: any) {
  return {
    type: ENTITIES_FETCH_FAIL,
    entityType,
    listKey,
    error,
  };
}

/** Any action pertaining to entities. */
type EntityAction =
  ReturnType<typeof importEntities>
  | ReturnType<typeof deleteEntities>
  | ReturnType<typeof entitiesFetchRequest>
  | ReturnType<typeof entitiesFetchSuccess>
  | ReturnType<typeof entitiesFetchFail>;

export {
  ENTITIES_IMPORT,
  ENTITIES_DELETE,
  ENTITIES_FETCH_REQUEST,
  ENTITIES_FETCH_SUCCESS,
  ENTITIES_FETCH_FAIL,
  importEntities,
  deleteEntities,
  entitiesFetchRequest,
  entitiesFetchSuccess,
  entitiesFetchFail,
  EntityAction,
};

export type { DeleteEntitiesOpts };