import { useAppDispatch } from './useAppDispatch.ts';

import type { RootState } from 'soapbox/store.ts';

/**
 * Provides a `getState()` function to hooks.
 * You should prefer `useAppSelector` when possible.
 */
function useGetState() {
  const dispatch = useAppDispatch();
  return () => dispatch((_, getState: () => RootState) => getState());
}

export { useGetState };