import { nip13, type Event, type UnsignedEvent, getEventHash } from 'nostr-tools';

/**
 * Mine an event with the desired POW. This function mutates the event.
 * Note that this operation is synchronous and should be run in a worker context to avoid blocking the main thread.
 *
 * Adapted from Snort: https://git.v0l.io/Kieran/snort/src/commit/4df6c19248184218c4c03728d61e94dae5f2d90c/packages/system/src/pow-util.ts#L14-L36
 */
function minePow<K extends number>(unsigned: UnsignedEvent<K>, difficulty: number): Omit<Event<K>, 'sig'> {
  let count = 0;

  const event = unsigned as Omit<Event<K>, 'sig'>;
  const tag = ['nonce', count.toString(), difficulty.toString()];

  event.tags.push(tag);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const now = Math.floor(new Date().getTime() / 1000);

    if (now !== event.created_at) {
      count = 0;
      event.created_at = now;
    }

    tag[1] = (++count).toString();

    event.id = getEventHash(event);

    if (nip13.getPow(event.id) >= difficulty) {
      break;
    }
  }

  return event;
}

export { minePow };