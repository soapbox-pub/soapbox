import { Map as ImmutableMap, fromJS } from 'immutable';

import alexJson from 'soapbox/__fixtures__/pleroma-account.json';
import { normalizeAccount, normalizeInstance } from 'soapbox/normalizers';

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
  accounts: ImmutableMap({
    [alexJson.id]: normalizeAccount(alexJson),
  }),
};

export {
  storeOpen,
  storeClosed,
  storePepeOpen,
  storePepeClosed,
  storeLoggedIn,
};