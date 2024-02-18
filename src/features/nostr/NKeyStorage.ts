import { getPublicKey, nip19 } from 'nostr-tools';
import { NSchema as n, NostrSigner, NSecSigner } from 'nspec';
import { z } from 'zod';

import { lockStorageKey } from 'soapbox/utils/storage';

/**
 * Gets Nostr keypairs from storage and returns a `Map`-like object of signers.
 * When instantiated, it will lock the storage key to prevent tampering.
 * Changes to the object will sync to storage.
 */
export class NKeyStorage implements ReadonlyMap<string, NostrSigner> {

  #keypairs = new Map<string, Uint8Array>();
  #storage: Storage;
  #storageKey: string;

  constructor(storage: Storage, storageKey: string) {
    this.#storage = storage;
    this.#storageKey = storageKey;

    const data = this.#storage.getItem(storageKey);
    lockStorageKey(storageKey);

    try {
      for (const nsec of this.#dataSchema().parse(data)) {
        const { data: secretKey } = nip19.decode(nsec);
        const pubkey = getPublicKey(secretKey);
        this.#keypairs.set(pubkey, secretKey);
      }
    } catch (e) {
      this.clear();
    }
  }

  #dataSchema() {
    return n.json().pipe(z.set(this.#nsecSchema()));
  }

  #nsecSchema() {
    return n.bech32().refine((v): v is `nsec1${string}` => v.startsWith('nsec1'), { message: 'Invalid secret key' });
  }

  #syncStorage() {
    const secretKeys = [...this.#keypairs.values()].map(nip19.nsecEncode);
    this.#storage.setItem(this.#storageKey, JSON.stringify(secretKeys));
  }

  get size(): number {
    return this.#keypairs.size;
  }

  clear(): void {
    this.#keypairs.clear();
    this.#syncStorage();
  }

  delete(pubkey: string): boolean {
    const result = this.#keypairs.delete(pubkey);
    this.#syncStorage();
    return result;
  }

  forEach(callbackfn: (signer: NostrSigner, pubkey: string, map: typeof this) => void, thisArg?: any): void {
    for (const [pubkey] of this.#keypairs) {
      const signer = this.get(pubkey);
      if (signer) {
        callbackfn.call(thisArg, signer, pubkey, this);
      }
    }
  }

  get(pubkey: string): NostrSigner | undefined {
    const secretKey = this.#keypairs.get(pubkey);
    if (secretKey) {
      return new NSecSigner(secretKey);
    }
  }

  has(pubkey: string): boolean {
    return this.#keypairs.has(pubkey);
  }

  add(secretKey: Uint8Array): void {
    const pubkey = getPublicKey(secretKey);
    this.#keypairs.set(pubkey, secretKey);
    this.#syncStorage();
  }

  *entries(): IterableIterator<[string, NostrSigner]> {
    for (const [pubkey] of this.#keypairs) {
      yield [pubkey, this.get(pubkey)!];
    }
  }

  *keys(): IterableIterator<string> {
    for (const pubkey of this.#keypairs.keys()) {
      yield pubkey;
    }
  }

  *values(): IterableIterator<NostrSigner> {
    for (const pubkey of this.#keypairs.keys()) {
      yield this.get(pubkey)!;
    }
  }

  [Symbol.iterator](): IterableIterator<[string, NostrSigner]> {
    return this.entries();
  }

  [Symbol.toStringTag] = 'NKeyStorage';

}