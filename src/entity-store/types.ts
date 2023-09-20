/** A Mastodon API entity. */
interface Entity {
  /** Unique ID for the entity (usually the primary key in the database). */
  id: string
}

/** Store of entities by ID. */
interface EntityStore<TEntity extends Entity = Entity> {
  [id: string]: TEntity | undefined
}

/** List of entity IDs and fetch state. */
interface EntityList {
  /** Set of entity IDs in this list. */
  ids: Set<string>
  /** Server state for this entity list. */
  state: EntityListState
}

/** Fetch state for an entity list. */
interface EntityListState {
  /** Next URL for pagination, if any. */
  next: string | undefined
  /** Previous URL for pagination, if any. */
  prev: string | undefined
  /** Total number of items according to the API. */
  totalCount: number | undefined
  /** Error returned from the API, if any. */
  error: unknown
  /** Whether data has already been fetched */
  fetched: boolean
  /** Whether data for this list is currently being fetched. */
  fetching: boolean
  /** Date of the last API fetch for this list. */
  lastFetchedAt: Date | undefined
  /** Whether the entities should be refetched on the next component mount. */
  invalid: boolean
}

/** Cache data pertaining to a paritcular entity type.. */
interface EntityCache<TEntity extends Entity = Entity> {
  /** Map of entities of this type. */
  store: EntityStore<TEntity>
  /** Lists of entity IDs for a particular purpose. */
  lists: {
    [listKey: string]: EntityList | undefined
  }
}

/** Whether to import items at the start or end of the list. */
type ImportPosition = 'start' | 'end'

/** Map of entity mutation functions to perform at once on the store. */
interface EntitiesTransaction {
  [entityType: string]: {
    [entityId: string]: <TEntity extends Entity>(entity: TEntity) => TEntity
  }
}

export type {
  Entity,
  EntityStore,
  EntityList,
  EntityListState,
  EntityCache,
  ImportPosition,
  EntitiesTransaction,
};