import { getSoapboxConfig } from 'soapbox/actions/soapbox.ts';

import { useAppSelector } from './useAppSelector.ts';

import type { SoapboxConfig } from 'soapbox/types/soapbox.ts';

/** Get the Soapbox config from the store */
export const useSoapboxConfig = (): SoapboxConfig => {
  return useAppSelector((state) => getSoapboxConfig(state));
};
