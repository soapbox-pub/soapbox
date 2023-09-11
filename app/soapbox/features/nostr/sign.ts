import {
  type Event,
  type EventTemplate,
  generatePrivateKey,
  getPublicKey as _getPublicKey,
  finishEvent,
} from 'nostr-tools';

const privateKey = generatePrivateKey();

async function getPublicKey(): Promise<string> {
  return window.nostr ? window.nostr.getPublicKey() : _getPublicKey(privateKey);
}

async function signEvent<K extends number>(event: EventTemplate<K>): Promise<Event<K>> {
  return window.nostr ? window.nostr.signEvent(event) as Promise<Event<K>> : finishEvent(event, privateKey) ;
}

export { getPublicKey, signEvent };