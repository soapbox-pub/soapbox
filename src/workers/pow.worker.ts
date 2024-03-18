import * as Comlink from 'comlink';
import { nip13, type UnsignedEvent } from 'nostr-tools';

export const PowWorker = {
  mine(event: UnsignedEvent, difficulty: number) {
    return nip13.minePow(event, difficulty);
  },
};

Comlink.expose(PowWorker);