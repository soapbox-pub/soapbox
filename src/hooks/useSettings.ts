import { useMemo } from 'react';

import { getSettings } from 'soapbox/actions/settings';
import { settingsSchema } from 'soapbox/schemas/soapbox/settings';

import { useAppSelector } from './useAppSelector';

/** Get the user settings from the store */
export const useSettings = () => {
  const data = useAppSelector((state) => getSettings(state));
  return useMemo(() => settingsSchema.parse(data.toJS()), [data]);
};
