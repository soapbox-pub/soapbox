import { hexToBytes } from '@noble/hashes/utils';
import { type NostrSigner, type NostrEvent, NSecSigner } from 'nspec';

/** Use key from `localStorage` if available, falling back to NIP-07. */
export class SoapboxSigner implements NostrSigner {

  #signer: NostrSigner;

  constructor() {
    const privateKey = localStorage.getItem('soapbox:nostr:privateKey');
    const signer = privateKey ? new NSecSigner(hexToBytes(privateKey)) : window.nostr;

    if (!signer) {
      throw new Error('No Nostr signer available');
    }

    this.#signer = signer;
  }

  async getPublicKey(): Promise<string> {
    return this.#signer.getPublicKey();
  }

  async signEvent(event: Omit<NostrEvent, 'id' | 'pubkey' | 'sig'>): Promise<NostrEvent> {
    return this.#signer.signEvent(event);
  }

  nip04 = {
    encrypt: (pubkey: string, plaintext: string): Promise<string> => {
      if (!this.#signer.nip04) {
        throw new Error('NIP-04 not supported by signer');
      }
      return this.#signer.nip04.encrypt(pubkey, plaintext);
    },

    decrypt: (pubkey: string, ciphertext: string): Promise<string> => {
      if (!this.#signer.nip04) {
        throw new Error('NIP-04 not supported by signer');
      }
      return this.#signer.nip04.decrypt(pubkey, ciphertext);
    },
  };

}