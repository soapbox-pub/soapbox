import seedrandom from 'seedrandom';

import type { PickAlgorithm } from './types';

type Opts = {
  /** Randomization seed. */
  seed: string
  /**
   * Start/end index of the slot by which one item will be randomly picked per page.
   *
   * Eg. `[2, 6]` will cause one item to be picked among the third through seventh indexes.
   *
   * `end` must be larger than `start`.
   */
  range: [start: number, end: number]
  /** Number of items in the page. */
  pageSize: number
};

/**
 * Algorithm to display items per-page.
 * One item is randomly inserted into each page within the index range.
 */
const abovefoldAlgorithm: PickAlgorithm = (items, iteration, rawOpts) => {
  const opts = normalizeOpts(rawOpts);
  /** Current page of the index. */
  const page = Math.floor(iteration / opts.pageSize);
  /** Current index within the page. */
  const pageIndex = (iteration % opts.pageSize);
  /** RNG for the page. */
  const rng = seedrandom(`${opts.seed}-page-${page}`);
  /** Index to insert the item. */
  const insertIndex = Math.floor(rng() * (opts.range[1] - opts.range[0])) + opts.range[0];

  if (pageIndex === insertIndex) {
    return items[page % items.length];
  }
};

const normalizeOpts = (opts: unknown): Opts => {
  const { seed, range, pageSize } = (opts && typeof opts === 'object' ? opts : {}) as Record<any, unknown>;

  return {
    seed: typeof seed === 'string' ? seed : '',
    range: Array.isArray(range) ? [Number(range[0]), Number(range[1])] : [2, 6],
    pageSize: typeof pageSize === 'number' ? pageSize : 20,
  };
};

export {
  abovefoldAlgorithm,
};
