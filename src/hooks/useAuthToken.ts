import { selectAccount } from 'soapbox/selectors';
import { RootState } from 'soapbox/store';
import { getAuthUserId, getAuthUserUrl } from 'soapbox/utils/auth';

import { useAppSelector } from './useAppSelector';

export function useAuthToken(): string | undefined {
  const getMeId = (state: RootState) => state.me || getAuthUserId(state);

  const getMeUrl = (state: RootState) => {
    const accountId = getMeId(state);
    if (accountId) {
      return selectAccount(state, accountId)?.url || getAuthUserUrl(state);
    }
  };

  const getMeToken = (state: RootState) => {
    // Fallback for upgrading IDs to URLs
    const accountUrl = getMeUrl(state) || state.auth.me;
    return state.auth.users.get(accountUrl!)?.access_token;
  };

  return useAppSelector((state) => getMeToken(state));
}