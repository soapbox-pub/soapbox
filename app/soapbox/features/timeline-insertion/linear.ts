import type { PickAlgorithm } from './types';

type Opts = {
  /** Number of iterations until the next item is picked. */
  interval: number,
};

/** Picks the next item every iteration. */
const linearAlgorithm: PickAlgorithm = (items, iteration, opts: Opts) => {
  const itemIndex = items ? Math.floor((iteration + 1) / opts.interval) % items.length : 0;
  const item = items ? items[itemIndex] : undefined;
  const showItem = (iteration + 1) % opts.interval === 0;

  return showItem ? item : undefined;
};

export {
  linearAlgorithm,
};