import alexJson from 'soapbox/__fixtures__/pleroma-account.json';
import { normalizeInstance } from 'soapbox/normalizers';

import { buildAccount } from './factory';

/** Store with registrations open. */
const storeOpen = { instance: normalizeInstance({ registrations: true }) };

/** Store with registrations closed. */
const storeClosed = { instance: normalizeInstance({ registrations: false }) };

/** Store with a logged-in user. */
const storeLoggedIn = {
  me: alexJson.id,
  accounts: {
    [alexJson.id]: buildAccount(alexJson as any),
  },
};

export {
  storeOpen,
  storeClosed,
  storeLoggedIn,
};