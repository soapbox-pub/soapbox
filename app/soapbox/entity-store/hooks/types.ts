import type { Entity } from '../types';
import type { AxiosRequestConfig } from 'axios';
import type z from 'zod';

type EntitySchema<TEntity extends Entity = Entity> = z.ZodType<TEntity, z.ZodTypeDef, any>;

/**
 * Tells us where to find/store the entity in the cache.
 * This value is accepted in hooks, but needs to be parsed into an `EntitiesPath`
 * before being passed to the store.
 */
type ExpandedEntitiesPath = [
  /** Name of the entity type for use in the global cache, eg `'Notification'`. */
  entityType: string,
  /**
   * Name of a particular index of this entity type.
   * Multiple params get combined into one string with a `:` separator.
   */
  ...listKeys: string[],
]

/** Used to look up an entity in a list. */
type EntitiesPath = [entityType: string, listKey: string]

/** Used to look up a single entity by its ID. */
type EntityPath = [entityType: string, entityId: string]

/**
 * Passed into hooks to make requests.
 * Can be a URL for GET requests, or a request object.
 */
type EntityRequest = string | URL | AxiosRequestConfig;

export type {
  EntitySchema,
  ExpandedEntitiesPath,
  EntitiesPath,
  EntityPath,
  EntityRequest,
};