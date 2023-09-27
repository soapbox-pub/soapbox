import WebSocketClient from '@gamestdio/websocket';

import { type RelayOK, relayOkSchema } from 'soapbox/schemas/nostr';

import { Pubsub } from './pubsub';
import { Relay } from './relay';

interface SendOpts {
  timeout?: number
}

class NiceRelay {

  socket: WebSocket;
  #relay: Relay;
  #subs = new Pubsub();

  constructor(url: string | URL) {
    this.socket = new WebSocketClient(url.toString());
    this.#relay = new Relay(this.socket);
  }

  /** Send a message to the relay, and wait for the `OK` if it's an event message. */
  async send(msg: ['EVENT', { id: string }], opts: { timeout: number }): Promise<RelayOK | void>;
  async send(msg: [string, ...unknown[]], opts?: SendOpts): Promise<void>;
  async send(msg: [string, ...unknown[]], opts: SendOpts = {}): Promise<RelayOK | void> {
    const { timeout = 0 } = opts;

    this.#relay.send(msg);

    if (msg[0] === 'EVENT' && msg[1] && timeout) {
      const event = msg[1] as { id: string };
      const { signal, abort } = new AbortController();

      setTimeout(() => abort(), timeout);

      for await (const resp of this.#relay.stream(signal)) {
        if (resp[0] === 'OK' && resp[1] === event.id) {
          const result = relayOkSchema.safeParse(resp);
          if (result.success) {
            abort();
            return result.data;
          }
        }
      }
    }
  }

}

export { NiceRelay };