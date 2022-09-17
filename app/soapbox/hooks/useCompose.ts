import { useAppSelector } from 'soapbox/hooks';

import type { ReducerCompose } from 'soapbox/reducers/compose';

/** Get compose for given key with fallback to 'default' */
export const useCompose = <ID extends string>(composeId: ID extends 'default' ? never : ID): ReturnType<typeof ReducerCompose> => {
  return useAppSelector((state) => state.compose.get(composeId, state.compose.get('default')!));
};
