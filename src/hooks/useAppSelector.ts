import { TypedUseSelectorHook, useSelector } from 'react-redux';

import type { RootState } from '@/store.ts';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
