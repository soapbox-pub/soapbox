import * as Comlink from 'comlink';

import type { PowWorker } from './workers/pow.worker.ts';

const powWorker = Comlink.wrap<typeof PowWorker>(
  new Worker(new URL('./workers/pow.worker.ts', import.meta.url), { type: 'module' }),
);

export { powWorker };