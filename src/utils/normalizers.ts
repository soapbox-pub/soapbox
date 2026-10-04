import z from 'zod';

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
