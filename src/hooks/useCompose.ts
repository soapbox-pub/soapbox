import { useAppSelector } from './useAppSelector.ts';

import type { ReducerCompose } from 'soapbox/reducers/compose.ts';

/** Get compose for given key with fallback to 'default' */
export const useCompose = <ID extends string>(composeId: ID extends 'default' ? never : ID): ReturnType<typeof ReducerCompose> => {
  return useAppSelector((state) => state.compose.get(composeId, state.compose.get('default')!));
};
