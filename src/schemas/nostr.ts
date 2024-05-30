import { NSchema as n } from '@nostrify/nostrify';
import { verifyEvent } from 'nostr-tools';

/** Nostr event schema that also verifies the event's signature. */
const signedEventSchema = n.event().refine(verifyEvent);

export { signedEventSchema };