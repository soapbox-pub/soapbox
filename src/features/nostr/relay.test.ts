import { Relay } from './relay';

import type { Event } from 'nostr-tools';

test('relay', async () => {
  const results: Event[] = [];

  const relay = new Relay('ws://localhost:8080');
  const sub = relay.req([{ kinds: [1] }]);

  for await (const msg of sub.stream()) {
    switch (msg[0]) {
      case 'EVENT':
        results.push(msg[2]);
        break;
      case 'EOSE':
        sub.close();
        break;
    }
  }

  relay.close();
});