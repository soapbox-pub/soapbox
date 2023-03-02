import type { PickAlgorithm } from './types';

type Opts = {
  /** Number of iterations until the next item is picked. */
  interval: number
};

/** Picks the next item every iteration. */
const linearAlgorithm: PickAlgorithm = (items, iteration, rawOpts) => {
  const opts = normalizeOpts(rawOpts);
  const itemIndex = items ? Math.floor(iteration / opts.interval) % items.length : 0;
  const item = items ? items[itemIndex] : undefined;
  const showItem = (iteration + 1) % opts.interval === 0;

  return showItem ? item : undefined;
};

const normalizeOpts = (opts: unknown): Opts => {
  const { interval } = (opts && typeof opts === 'object' ? opts : {}) as Record<any, unknown>;

  return {
    interval: typeof interval === 'number' ? interval : 20,
  };
};

export {
  linearAlgorithm,
};