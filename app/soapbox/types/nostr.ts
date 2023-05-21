import type { Event, EventTemplate } from 'nostr-tools';

interface Nostr {
  getPublicKey(): Promise<string>
  signEvent(event: EventTemplate): Promise<Event>
}

export default Nostr;