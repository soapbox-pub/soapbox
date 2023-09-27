import { relayUnknownSchema } from 'soapbox/schemas/nostr';
import { jsonSchema } from 'soapbox/schemas/utils';

import { AsyncSocket } from './socket';

class Relay {

  socket: WebSocket;

  constructor(socket: WebSocket) {
    this.socket = socket;
  }

  async * stream(signal: AbortSignal): AsyncGenerator<[string, ...unknown[]]> {
    const messages = AsyncSocket.messages(this.socket, signal);

    for await (const { data } of messages) {
      const result = jsonSchema.pipe(relayUnknownSchema).safeParse(data);

      if (result.success) {
        yield result.data;
      }
    }
  }

  send(msg: [string, ...unknown[]]): void {
    const data = JSON.stringify(msg);
    const listener = () => this.socket.send(data);

    this.socket.addEventListener('open', listener, { once: true });
  }

  close() {
    this.socket.close();
  }

}

export { Relay };