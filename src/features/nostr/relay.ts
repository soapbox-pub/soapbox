/* eslint-disable no-loop-func */
import WebSocketClient from '@gamestdio/websocket';

import { AsyncSocket } from './socket';

import type { Filter } from 'nostr-tools';

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

    for await (const { data } of this.messages(signal)) {
      console.log(data);
    }
  }

  messages(signal: AbortSignal) {
    return AsyncSocket.messages(this.socket, signal);
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