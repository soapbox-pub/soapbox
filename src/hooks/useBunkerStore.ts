import { NSchema as n } from '@nostrify/nostrify';
import { produce } from 'immer';
import { nip19 } from 'nostr-tools';
import { z } from 'zod';
import { create } from 'zustand';
// eslint-disable-next-line import/extensions
import { persist } from 'zustand/middleware';

import { filteredArray, jsonSchema } from 'soapbox/schemas/utils';

/**
 * A bunker connection maps an OAuth token from Mastodon API to a user pubkey and bunker keypair.
 * The user pubkey is used to determine whether to use keys from localStorage or a browser extension,
 * and the bunker keypair is used to sign and encrypt NIP-46 messages.
 */
interface BunkerConnection {
  /** User pubkey. Events will be signed by this pubkey. */
  pubkey: string;
  /** Mastodon API access token associated with this connection. */
  accessToken: string;
  /** Pubkey of the app authorized to sign events with this connection. */
  authorizedPubkey: string;
  /** Secret key for this connection. NIP-46 responses will be signed by this key. */
  bunkerSeckey: Uint8Array;
}

const connectionSchema = z.object({
  pubkey: z.string(),
  accessToken: z.string(),
  authorizedPubkey: z.string(),
  bunkerSeckey: n.bech32('nsec'),
});

interface BunkerState {
  connections: BunkerConnection[];
  connect(connection: BunkerConnection): void;
}

export const useBunkerStore = create<BunkerState>()(
  persist(
    (setState) => ({
      connections: [],

      /** Connect to a bunker using the authorization secret. */
      connect(connection: BunkerConnection): void {
        setState((state) => {
          return produce(state, (draft) => {
            draft.connections.push(connection);
          });
        });
      },

      /** Revoke any connections associated with the access token. */
      revoke(accessToken: string) {
        setState((state) => {
          return produce(state, (draft) => {
            draft.connections = draft.connections.filter((conn) => conn.accessToken !== accessToken);
          });
        });
      },
    }),
    {
      name: 'soapbox:bunker',
      storage: {
        getItem(name) {
          const connections = jsonSchema(nsecReviver)
            .pipe(filteredArray(connectionSchema))
            .catch([])
            .parse(localStorage.getItem(name));

          return { state: { connections } };
        },
        setItem(name, { state }) {
          localStorage.setItem(name, JSON.stringify(state.connections, nsecReplacer));
        },
        removeItem(name) {
          localStorage.removeItem(name);
        },
      },
    },
  ),
);

/** Encode Uint8Arrays into nsec strings. */
function nsecReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Uint8Array) {
    return nip19.nsecEncode(value);
  }

  return value;
}

/** Decode nsec strings into Uint8Arrays. */
function nsecReviver(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && value.startsWith('nsec1')) {
    return nip19.decode(value as `nsec1${string}`).data;
  }

  return value;
}