/** Whether the value is a plain object (not an array, class instance, or null). */
export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

/**
 * Deeply merge plain objects, returning a new object.
 * Later sources win. Nested plain objects are merged recursively; anything else (including arrays) is replaced.
 */
export const mergeDeep = <T extends Record<string, any>>(target: T, ...sources: unknown[]): T => {
  const result: Record<string, unknown> = { ...target };

  for (const source of sources) {
    if (!isPlainObject(source)) continue;

    for (const [key, value] of Object.entries(source)) {
      const existing = result[key];

      if (isPlainObject(existing) && isPlainObject(value)) {
        result[key] = mergeDeep(existing, value);
      } else if (value !== undefined) {
        result[key] = value;
      }
    }
  }

  return result as T;
};
