import { TypedUseSelectorHook, useSelector } from 'react-redux';

import type { RootState } from 'soapbox/store.ts';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
