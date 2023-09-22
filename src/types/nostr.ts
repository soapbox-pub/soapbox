import type { Event, EventTemplate } from 'nostr-tools';

interface Nostr {
  getPublicKey(): Promise<string>
  signEvent(event: EventTemplate): Promise<Event>
  nip04?: {
    encrypt: (pubkey: string, plaintext: string) => Promise<string>
    decrypt: (pubkey: string, ciphertext: string) => Promise<string>
  }
}

export default Nostr;