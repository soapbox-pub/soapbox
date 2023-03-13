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
  /** Error returned from the API, if any. */
  error: any
  /** Whether data has already been fetched */
  fetched: boolean
  /** Whether data for this list is currently being fetched. */
  fetching: boolean
  /** Date of the last API fetch for this list. */
  lastFetchedAt: Date | undefined
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

export {
  Entity,
  EntityStore,
  EntityList,
  EntityListState,
  EntityCache,
};