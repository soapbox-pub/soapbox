import { verifyEvent } from 'nostr-tools';
import { z } from 'zod';

/** Schema to validate Nostr hex IDs such as event IDs and pubkeys. */
const nostrIdSchema = z.string().regex(/^[0-9a-f]{64}$/);
/** Nostr kinds are positive integers. */
const kindSchema = z.number().int().nonnegative();

/** Nostr event template schema. */
const eventTemplateSchema = z.object({
  kind: kindSchema,
  tags: z.array(z.array(z.string())),
  content: z.string(),
  created_at: z.number(),
});

/** Nostr event schema. */
const eventSchema = eventTemplateSchema.extend({
  id: nostrIdSchema,
  pubkey: nostrIdSchema,
  sig: z.string(),
});

/** Nostr event schema that also verifies the event's signature. */
const signedEventSchema = eventSchema.refine(verifyEvent);

/** NIP-46 signer request. */
const connectRequestSchema = z.object({
  id: z.string(),
  method: z.literal('sign_event'),
  params: z.tuple([z.string()]),
});

/** NIP-47 signer response. */
const nwcRequestSchema = z.object({
  method: z.literal('pay_invoice'),
  params: z.object({
    invoice: z.string(),
  }),
});

export { nostrIdSchema, kindSchema, eventSchema, signedEventSchema, connectRequestSchema, nwcRequestSchema };