import { NSchema as n } from '@nostrify/nostrify';
import { verifyEvent } from 'nostr-tools';
import { z } from 'zod';

/** Nostr event schema that also verifies the event's signature. */
const signedEventSchema = n.event().refine(verifyEvent);

/** NIP-47 signer response. */
const nwcRequestSchema = z.object({
  method: z.literal('pay_invoice'),
  params: z.object({
    invoice: z.string(),
  }),
});

export { signedEventSchema, nwcRequestSchema };