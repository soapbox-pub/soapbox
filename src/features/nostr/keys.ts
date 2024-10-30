import { NKeyring } from './NKeyring';

export const NKeys = new NKeyring(
  localStorage,
  'soapbox:nostr:keys',
);
