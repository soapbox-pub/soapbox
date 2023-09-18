import { abovefoldAlgorithm } from './abovefold';
import { linearAlgorithm } from './linear';

import type { PickAlgorithm } from './types';

const ALGORITHMS: Record<any, PickAlgorithm | undefined> = {
  'linear': linearAlgorithm,
  'abovefold': abovefoldAlgorithm,
};

export { ALGORITHMS };