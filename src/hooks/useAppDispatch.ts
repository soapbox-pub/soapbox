import { useDispatch } from 'react-redux';

import type { AppDispatch } from 'soapbox/store.ts';

export const useAppDispatch = () => useDispatch<AppDispatch>();