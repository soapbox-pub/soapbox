/**
 * Returns an item to insert at the index, or `undefined` if an item shouldn't be inserted.
 */
type PickAlgorithm = <D = any>(
  /** Elligible candidates to pick. */
  items: readonly D[],
  /** Current iteration by which an item may be chosen. */
  iteration: number,
  /** Implementation-specific opts. */
  opts: Record<string, unknown>
) => D | undefined;

export {
  PickAlgorithm,
};