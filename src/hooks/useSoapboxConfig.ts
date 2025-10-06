import { getSoapboxConfig } from '@/actions/soapbox.ts';

import { useAppSelector } from './useAppSelector.ts';

import type { SoapboxConfig } from '@/types/soapbox.ts';

/** Get the Soapbox config from the store */
export const useSoapboxConfig = (): SoapboxConfig => {
  return useAppSelector((state) => getSoapboxConfig(state));
};
