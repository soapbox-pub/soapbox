/* eslint-disable no-loop-func */
import WebSocketClient from '@gamestdio/websocket';
import { matchFilters, type Filter } from 'nostr-tools';

import { type RelayEOSE, type RelayEVENT, type RelayMsg, relayMsgSchema } from 'soapbox/schemas/nostr';
import { jsonSchema } from 'soapbox/schemas/utils';

import { Pubsub } from './pubsub';
import { AsyncSocket } from './socket';

class Relay {

  socket: WebSocket;
  #subs = new Pubsub<RelayEVENT | RelayEOSE>();
  #controller = new AbortController();

  constructor(url: string | URL) {
    this.socket = new WebSocketClient(url.toString());
    this.#init();
  }

  async #init() {
    const { signal } = this.#controller;

    for await (const msg of this.messages(signal)) {
      switch (msg[0]) {
        case 'EVENT':
        case 'EOSE':
          this.#subs.publish(msg[1], msg);
          break;
      }
    }
  }

  async * messages(signal: AbortSignal): AsyncGenerator<RelayMsg> {
    for await (const { data } of AsyncSocket.messages(this.socket, signal)) {
      yield jsonSchema.pipe(relayMsgSchema).parse(data);
    }
  }

  listen() {
    const { signal, abort } = new AbortController();

    return {
      messages: this.messages(signal),
      abort,
    };
  }

  send(cmd: [string, ...unknown[]]): void {
    this.socket.send(JSON.stringify(cmd));
  }

  close() {
    this.#controller.abort();
    this.socket.close();
    this.#subs.close();
  }

  req(filters: Filter[]) {
    const id = crypto.randomUUID();
    const sub = this.#subs.subscribe(id);
    this.send(['REQ', id, filters]);

    return {
      id,
      close: () => {
        this.send(['CLOSE', id]);
        sub.close();
      },
      stream: async function* (): AsyncGenerator<RelayEVENT | RelayEOSE> {
        for await (const msg of sub.stream()) {
          switch (msg[0]) {
            case 'EVENT':
              if (matchFilters(filters, msg[2])) {
                yield msg;
              }
              break;
            case 'EOSE':
              yield msg;
              break;
          }
        }
      },
    };
  }

}

export { Relay };