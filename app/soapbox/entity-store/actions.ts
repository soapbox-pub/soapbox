import type { EntitiesTransaction, Entity, EntityListState, ImportPosition } from './types';

const ENTITIES_IMPORT = 'ENTITIES_IMPORT' as const;
const ENTITIES_DELETE = 'ENTITIES_DELETE' as const;
const ENTITIES_DISMISS = 'ENTITIES_DISMISS' as const;
const ENTITIES_INCREMENT = 'ENTITIES_INCREMENT' as const;
const ENTITIES_FETCH_REQUEST = 'ENTITIES_FETCH_REQUEST' as const;
const ENTITIES_FETCH_SUCCESS = 'ENTITIES_FETCH_SUCCESS' as const;
const ENTITIES_FETCH_FAIL = 'ENTITIES_FETCH_FAIL' as const;
const ENTITIES_INVALIDATE_LIST = 'ENTITIES_INVALIDATE_LIST' as const;
const ENTITIES_TRANSACTION = 'ENTITIES_TRANSACTION' as const;

/** Action to import entities into the cache. */
function importEntities(entities: Entity[], entityType: string, listKey?: string, pos?: ImportPosition) {
  return {
    type: ENTITIES_IMPORT,
    entityType,
    entities,
    listKey,
    pos,
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

function dismissEntities(ids: Iterable<string>, entityType: string, listKey: string) {
  return {
    type: ENTITIES_DISMISS,
    ids,
    entityType,
    listKey,
  };
}

function incrementEntities(entityType: string, listKey: string, diff: number) {
  return {
    type: ENTITIES_INCREMENT,
    entityType,
    listKey,
    diff,
  };
}

function entitiesFetchRequest(entityType: string, listKey?: string) {
  return {
    type: ENTITIES_FETCH_REQUEST,
    entityType,
    listKey,
  };
}

function entitiesFetchSuccess(
  entities: Entity[],
  entityType: string,
  listKey?: string,
  pos?: ImportPosition,
  newState?: EntityListState,
  overwrite = false,
) {
  return {
    type: ENTITIES_FETCH_SUCCESS,
    entityType,
    entities,
    listKey,
    pos,
    newState,
    overwrite,
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

function invalidateEntityList(entityType: string, listKey: string) {
  return {
    type: ENTITIES_INVALIDATE_LIST,
    entityType,
    listKey,
  };
}

function entitiesTransaction(transaction: EntitiesTransaction) {
  return {
    type: ENTITIES_TRANSACTION,
    transaction,
  };
}

/** Any action pertaining to entities. */
type EntityAction =
  ReturnType<typeof importEntities>
  | ReturnType<typeof deleteEntities>
  | ReturnType<typeof dismissEntities>
  | ReturnType<typeof incrementEntities>
  | ReturnType<typeof entitiesFetchRequest>
  | ReturnType<typeof entitiesFetchSuccess>
  | ReturnType<typeof entitiesFetchFail>
  | ReturnType<typeof invalidateEntityList>
  | ReturnType<typeof entitiesTransaction>;

export {
  ENTITIES_IMPORT,
  ENTITIES_DELETE,
  ENTITIES_DISMISS,
  ENTITIES_INCREMENT,
  ENTITIES_FETCH_REQUEST,
  ENTITIES_FETCH_SUCCESS,
  ENTITIES_FETCH_FAIL,
  ENTITIES_INVALIDATE_LIST,
  ENTITIES_TRANSACTION,
  importEntities,
  deleteEntities,
  dismissEntities,
  incrementEntities,
  entitiesFetchRequest,
  entitiesFetchSuccess,
  entitiesFetchFail,
  invalidateEntityList,
  entitiesTransaction,
};

export type { DeleteEntitiesOpts, EntityAction };