import {
  type Event,
  type EventTemplate,
  generatePrivateKey,
  getPublicKey as _getPublicKey,
  finishEvent,
  nip04 as _nip04,
} from 'nostr-tools';
import { type  NostrSigner } from 'nspec';

import { powWorker } from 'soapbox/workers';

/** localStorage key for the Nostr private key (if not using NIP-07). */
const LOCAL_KEY = 'soapbox:nostr:privateKey';

/** Get the private key from the browser, or generate one. */
const getPrivateKey = (): string => {
  const local = localStorage.getItem(LOCAL_KEY);

  if (!local) {
    const key = generatePrivateKey();
    localStorage.setItem(LOCAL_KEY, key);
    return key;
  }

  return local;
};

/** Get the user's public key from NIP-07, or generate one. */
async function getPublicKey(): Promise<string> {
  return window.nostr ? window.nostr.getPublicKey() : _getPublicKey(getPrivateKey());
}

interface SignEventOpts {
  pow?: number;
}

/** Sign an event with NIP-07, or the locally generated key. */
async function signEvent<K extends number>(template: EventTemplate<K>, opts: SignEventOpts = {}): Promise<Event<K>> {
  if (opts.pow) {
    const event = await powWorker.mine({ ...template, pubkey: await getPublicKey() }, opts.pow) as Omit<Event<K>, 'sig'>;
    return window.nostr ? window.nostr.signEvent(event) as Promise<Event<K>> : finishEvent(event, getPrivateKey()) ;
  } else {
    return window.nostr ? window.nostr.signEvent(template) as Promise<Event<K>> : finishEvent(template, getPrivateKey()) ;
  }
}

/** Crypto function with NIP-07, or the local key. */
const nip04 = {
  /** Encrypt with NIP-07, or the local key. */
  encrypt: async (pubkey: string, content: string) => {
    return window.nostr?.nip04
      ? window.nostr.nip04.encrypt(pubkey, content)
      : _nip04.encrypt(getPrivateKey(), pubkey, content);
  },
  /** Decrypt with NIP-07, or the local key. */
  decrypt: async (pubkey: string, content: string) => {
    return window.nostr?.nip04
      ? window.nostr.nip04.decrypt(pubkey, content)
      : _nip04.decrypt(getPrivateKey(), pubkey, content);
  },
};

const signer: NostrSigner = {
  getPublicKey,
  signEvent,
  nip04,
};

export { signer };