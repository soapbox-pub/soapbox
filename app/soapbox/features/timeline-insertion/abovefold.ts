import seedrandom from 'seedrandom';

import type { PickAlgorithm } from './types';

type Opts = {
  /** Randomization seed. */
  seed: string,
  /**
   * Start/end index of the slot by which one item will be randomly picked per page.
   *
   * Eg. `[3, 7]` will cause one item to be picked between the third and seventh indexes per page.
   *
   * `end` must be larger than `start`.
   */
  range: [start: number, end: number],
  /** Number of items in the page. */
  pageSize: number,
};

/**
 * Algorithm to display items per-page.
 * One item is randomly inserted into each page within the index range.
 */
const abovefoldAlgorithm: PickAlgorithm = (items, iteration, opts: Opts) => {
  /** Current page of the index. */
  const page = Math.floor(((iteration + 1) / opts.pageSize) - 1);
  /** Current index within the page. */
  const pageIndex = ((iteration + 1) % opts.pageSize) - 1;
  /** RNG for the page. */
  const rng = seedrandom(`${opts.seed}-page-${page}`);
  /** Index to insert the item. */
  const insertIndex = Math.floor(rng() * opts.range[1] - opts.range[0]) + opts.range[0];

  if (pageIndex === insertIndex) {
    return items[page % items.length];
  }
};

export {
  abovefoldAlgorithm,
};