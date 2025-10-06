import { useMemo } from 'react';

import { getSettings } from '@/actions/settings.ts';
import { settingsSchema } from '@/schemas/soapbox/settings.ts';

import { useAppSelector } from './useAppSelector.ts';

/** Get the user settings from the store */
export const useSettings = () => {
  const data = useAppSelector((state) => getSettings(state));
  return useMemo(() => settingsSchema.parse(data.toJS()), [data]);
};
