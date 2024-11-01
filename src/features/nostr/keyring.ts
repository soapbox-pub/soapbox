import { NKeyring } from './NKeyring';

export const keyring = new NKeyring(
  localStorage,
  'soapbox:nostr:keys',
);
