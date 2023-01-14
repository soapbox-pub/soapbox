import { RootState } from 'soapbox/store';

import { PLEROMA, parseVersion } from './features';

/**
 * Get the OAuth scopes to use for login & signup.
 * Mastodon will refuse scopes it doesn't know, so care is needed.
 */
const getScopes = (state: RootState) => {
  const instance = state.instance;
  const v = parseVersion(instance.version);

  switch (v.software) {
    case PLEROMA:
      return 'read write follow push admin';
    default:
      return 'read write follow push';
  }
};

export {
  getScopes,
};