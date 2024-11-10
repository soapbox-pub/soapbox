import { NSchema as n } from '@nostrify/nostrify';
import { produce } from 'immer';
import { z } from 'zod';
import { create } from 'zustand';
// eslint-disable-next-line import/extensions
import { persist } from 'zustand/middleware';

import { filteredArray, jsonSchema } from 'soapbox/schemas/utils.ts';

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
  /** Pubkey for this connection. Secret key is stored in the keyring. NIP-46 responses will be signed by this key. */
  bunkerPubkey: string;
}

const connectionSchema: z.ZodType<BunkerConnection> = z.object({
  pubkey: n.id(),
  accessToken: z.string(),
  authorizedPubkey: n.id(),
  bunkerPubkey: n.id(),
});

interface BunkerState {
  connections: BunkerConnection[];
  connect(connection: BunkerConnection): void;
  revoke(accessToken: string): void;
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
      revoke(accessToken: string): void {
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
          const value = localStorage.getItem(name);

          const connections = jsonSchema()
            .pipe(filteredArray(connectionSchema))
            .catch([])
            .parse(value);

          return { state: { connections } };
        },
        setItem(name, { state }) {
          localStorage.setItem(name, JSON.stringify(state.connections));
        },
        removeItem(name) {
          localStorage.removeItem(name);
        },
      },
    },
  ),
);
