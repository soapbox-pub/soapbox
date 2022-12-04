/** A Mastodon API entity. */
interface Entity {
  /** Unique ID for the entity (usually the primary key in the database). */
  id: string
}

/** Store of entities by ID. */
type EntityStore = Map<string, Entity>

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
  /** Whether data for this list is currently being fetched. */
  fetching: boolean
}

/** Cache data pertaining to a paritcular entity type.. */
interface EntityCache {
  /** Map of entities of this type. */
  store: EntityStore
  /** Lists of entity IDs for a particular purpose. */
  lists: Map<string, EntityList>
}

export {
  Entity,
  EntityStore,
  EntityList,
  EntityListState,
  EntityCache,
};