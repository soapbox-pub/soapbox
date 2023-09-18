import { fromJS } from 'immutable';

import alexJson from 'soapbox/__fixtures__/pleroma-account.json';
import { normalizeInstance } from 'soapbox/normalizers';

import { buildAccount } from './factory';

/** Store with registrations open. */
const storeOpen = { instance: normalizeInstance({ registrations: true }) };

/** Store with registrations closed. */
const storeClosed = { instance: normalizeInstance({ registrations: false }) };

/** Store with registrations closed, and Pepe enabled & open. */
const storePepeOpen = {
  instance: normalizeInstance({ registrations: false }),
  soapbox: fromJS({ extensions: { pepe: { enabled: true } } }),
  verification: { instance: fromJS({ registrations: true }) },
};

/** Store with registrations closed, and Pepe enabled & closed. */
const storePepeClosed = {
  instance: normalizeInstance({ registrations: false }),
  soapbox: fromJS({ extensions: { pepe: { enabled: true } } }),
  verification: { instance: fromJS({ registrations: false }) },
};

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
  storePepeOpen,
  storePepeClosed,
  storeLoggedIn,
};