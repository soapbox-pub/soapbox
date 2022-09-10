import type { PickAlgorithm } from './types';

type Opts = {
  /** Number of iterations until the next item is picked. */
  interval: number,
};

/** Picks the next item every `interval` iterations. */
const linearAlgorithm: PickAlgorithm = (items, index, opts: Opts) => {
  const itemIndex = items ? Math.floor((index + 1) / opts.interval) % items.length : 0;
  const item = items ? items[itemIndex] : undefined;
  const showItem = (index + 1) % opts.interval === 0;

  return showItem ? item : undefined;
};

export {
  linearAlgorithm,
};