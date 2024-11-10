import alexJson from 'soapbox/__fixtures__/pleroma-account.json';
import { instanceV1Schema } from 'soapbox/schemas/instance.ts';

import { buildAccount } from './factory.ts';

/** Store with registrations open. */
const storeOpen = { instance: instanceV1Schema.parse({ registrations: true }) };

/** Store with registrations closed. */
const storeClosed = { instance: instanceV1Schema.parse({ registrations: false }) };

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