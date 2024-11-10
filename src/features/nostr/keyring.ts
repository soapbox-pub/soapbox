import { NKeyring } from './NKeyring.ts';

export const keyring = new NKeyring(
  localStorage,
  'soapbox:nostr:keys',
);
