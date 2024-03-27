import { NKeyStorage } from './NKeyStorage';

export const NKeys = new NKeyStorage(
  localStorage,
  'soapbox:nostr:keys',
);
