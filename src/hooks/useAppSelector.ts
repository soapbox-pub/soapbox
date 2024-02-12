import { TypedUseSelectorHook, useSelector } from 'react-redux';

import type { RootState } from 'soapbox/store';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
