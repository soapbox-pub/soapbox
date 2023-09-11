import {
  type Event,
  type EventTemplate,
  generatePrivateKey,
  getPublicKey as _getPublicKey,
  finishEvent,
  nip04 as _nip04,
} from 'nostr-tools';

const privateKey = generatePrivateKey();

async function getPublicKey(): Promise<string> {
  return window.nostr ? window.nostr.getPublicKey() : _getPublicKey(privateKey);
}

async function signEvent<K extends number>(event: EventTemplate<K>): Promise<Event<K>> {
  return window.nostr ? window.nostr.signEvent(event) as Promise<Event<K>> : finishEvent(event, privateKey) ;
}

const nip04 = {
  encrypt: async (pubkey: string, content: string) => {
    return window.nostr?.nip04
      ? window.nostr.nip04.encrypt(pubkey, content)
      : _nip04.encrypt(privateKey, pubkey, content);
  },
  decrypt: async (pubkey: string, content: string) => {
    return window.nostr?.nip04
      ? window.nostr.nip04.decrypt(pubkey, content)
      : _nip04.decrypt(privateKey, pubkey, content);
  },
};

export { getPublicKey, signEvent, nip04 };