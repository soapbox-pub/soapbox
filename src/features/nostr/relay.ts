/* eslint-disable no-loop-func */
import WebSocketClient from '@gamestdio/websocket';
import { type Filter } from 'nostr-tools';

import { RelayMsg, relayMsgSchema } from 'soapbox/schemas/nostr';
import { jsonSchema } from 'soapbox/schemas/utils';

import { AsyncSocket } from './socket';

class Relay {

  socket: WebSocket;
  #controller: AbortController;

  constructor(url: string | URL) {
    this.socket = new WebSocketClient(url.toString());
    this.#controller = new AbortController();
    this.#init();
  }

  async #init() {
    const { signal } = this.#controller;

    for await (const msg of this.messages(signal)) {
      console.log(msg);
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
  }

  async req(filters: Filter[], abort?: AbortSignal) {
  }

}

export { Relay };