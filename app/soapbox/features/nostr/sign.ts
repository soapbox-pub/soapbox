import { type Event, type UnsignedEvent } from 'nostr-tools';

async function getPublicKey(): Promise<string> {
  return window.nostr!.getPublicKey();
}

async function signEvent<K extends number>(event: UnsignedEvent<K>): Promise<Event<K>> {
  return window.nostr!.signEvent(event) as Promise<Event<K>>;
}

export { getPublicKey, signEvent };