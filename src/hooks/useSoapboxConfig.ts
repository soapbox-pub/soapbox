import { getSoapboxConfig } from 'soapbox/actions/soapbox';

import { useAppSelector } from './useAppSelector';

import type { SoapboxConfig } from 'soapbox/types/soapbox';

/** Get the Soapbox config from the store */
export const useSoapboxConfig = (): SoapboxConfig => {
  return useAppSelector((state) => getSoapboxConfig(state));
};
