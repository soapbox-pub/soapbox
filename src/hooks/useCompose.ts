import { useAppSelector } from './useAppSelector.ts';

import type { Compose } from 'soapbox/reducers/compose.ts';

/** Get compose for given key with fallback to 'default' */
export const useCompose = <ID extends string>(composeId: ID extends 'default' ? never : ID): Compose => {
  return useAppSelector((state) => {
    const compose = state.compose[composeId];
    return compose || state.compose.default;
  });
};
