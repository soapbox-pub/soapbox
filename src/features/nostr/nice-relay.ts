import { matchFilters as _matchFilters, type Filter, type Event } from 'nostr-tools';

import { type RelayOK, relayOkSchema, RelayEVENT, RelayEOSE, relayMsgSchema } from 'soapbox/schemas/nostr';

import { Pubsub } from './pubsub';
import { Relay } from './relay';

interface SendOpts {
  timeout?: number
}

interface ReqOpts {
  id?: string
  matchFilters?: (filters: Filter[], event: Event) => boolean
}

interface RelaySub {
  id: string
  close: () => void
  eoseSignal: AbortSignal
  [Symbol.asyncIterator]: () => AsyncGenerator<Event>
}

class NiceRelay {

  socket: WebSocket;
  #relay: Relay;
  #subs = new Pubsub<RelayEVENT | RelayEOSE>();
  #controller = new AbortController();

  constructor(url: string | URL) {
    this.socket = new WebSocket(url.toString());
    this.#relay = new Relay(this.socket);
    this.#init();
  }

  async #init() {
    for await (const msg of this.#relay.stream(this.#controller.signal)) {
      const result = relayMsgSchema.safeParse(msg);
      if (!result.success) continue;

      switch (result.data[0]) {
        case 'EVENT':
        case 'EOSE':
          this.#subs.publish(result.data[1], result.data);
          break;
      }
    }
  }


  req<K extends number>(filters: Filter<K>[], opts: ReqOpts = {}): RelaySub {
    const { id = crypto.randomUUID(), matchFilters = _matchFilters } = opts;
    const controller = new AbortController();
    const sub = this.#subs.subscribe(id);

    this.send(['REQ', id, ...filters]);

    return {
      id,
      close: () => {
        this.send(['CLOSE', id]);
        sub.close();
      },
      eoseSignal: controller.signal,
      [Symbol.asyncIterator]: async function* (): AsyncGenerator<Event<K>> {
        for await (const msg of sub.stream()) {
          switch (msg[0]) {
            case 'EVENT':
              if (matchFilters(filters, msg[2])) {
                yield msg[2] as Event<K>;
              }
              break;
            case 'EOSE':
              controller.abort();
              break;
          }
        }
      },
    };
  }

  /** Send a message to the relay, and wait for the `OK` if it's an event message. */
  async send(msg: ['EVENT', { id: string }], opts: { timeout: number }): Promise<RelayOK | void>;
  async send(msg: [string, ...unknown[]], opts?: SendOpts): Promise<void>;
  async send(msg: [string, ...unknown[]], opts: SendOpts = {}): Promise<RelayOK | void> {
    const { timeout = 0 } = opts;

    this.#relay.send(msg);

    if (msg[0] === 'EVENT' && msg[1] && timeout) {
      const event = msg[1] as { id: string };
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), timeout);

      for await (const resp of this.#relay.stream(controller.signal)) {
        if (resp[0] === 'OK' && resp[1] === event.id) {
          const result = relayOkSchema.safeParse(resp);
          if (result.success) {
            clearTimeout(tid);
            controller.abort();
            return result.data;
          }
        }
      }
    }
  }

  close() {
    this.#relay.close();
    this.#subs.close();
  }

}

export { NiceRelay };