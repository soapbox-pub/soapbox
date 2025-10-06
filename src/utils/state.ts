/**
 * State: general Redux state utility functions.
 * @module soapbox/utils/state
 */

import { getSoapboxConfig } from '@/actions/soapbox.ts';
import * as BuildConfig from '@/build-config.ts';
import { selectOwnAccount } from '@/selectors/index.ts';
import { isURL } from '@/utils/auth.ts';

import type { RootState } from '@/store.ts';

/** Whether to display the fqn instead of the acct. */
export const displayFqn = (state: RootState): boolean => {
  return getSoapboxConfig(state).displayFqn;
};

/** Whether the instance exposes instance blocks through the API. */
export const federationRestrictionsDisclosed = (state: RootState): boolean => {
  return !!state.instance.pleroma.metadata.federation.mrf_policies;
};

const getHost = (url: any): string => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

/** Get the baseURL of the instance. */
export const getBaseURL = (state: RootState): string => {
  const account = selectOwnAccount(state);
  return isURL(BuildConfig.BACKEND_URL) ? BuildConfig.BACKEND_URL : getHost(account?.url);
};
