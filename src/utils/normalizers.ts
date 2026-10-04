import z from 'zod';

/** Use new value only if old value is undefined */
export const mergeDefined = (oldVal: any, newVal: any) => oldVal === undefined ? newVal : oldVal;

/**
 * Build an entity from a set of defaults, keeping only the known keys.
 * Like the Immutable Records this replaces, `undefined` falls back to the default.
 */
export const fromDefaults = <T extends object>(defaults: T, data: Record<string, any> = {}): T => {
  const result = { ...defaults };

  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    if (data[key] !== undefined) {
      result[key] = data[key];
    }
  }

  return result;
};

/** Normalize entity ID */
export const normalizeId = (id: unknown): string | null => {
  return z.string().nullable().catch(null).parse(id);
};

export type Normalizer<V, R> = (value: V) => R;

/**
 * Allows using any legacy normalizer function as a zod schema.
 *
 * @example
 * ```ts
 * const statusSchema = toSchema(normalizeStatus);
 * statusSchema.parse(status);
 * ```
 */
export const toSchema = <V, R>(normalizer: Normalizer<V, R>) => {
  return z.custom<V>().transform<R>(normalizer);
};
