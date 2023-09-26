import { verifySignature } from 'nostr-tools';
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
const signedEventSchema = eventSchema.refine(verifySignature);

/** NIP-46 signer request. */
const connectRequestSchema = z.object({
  id: z.string(),
  method: z.literal('sign_event'),
  params: z.tuple([eventTemplateSchema]),
});

const relayEventSchema = z.tuple([z.literal('EVENT'), z.string(), signedEventSchema]);
const relayOkSchema = z.tuple([z.literal('OK'), nostrIdSchema, z.boolean(), z.string()]);
const relayEoseSchema = z.tuple([z.literal('EOSE'), z.string()]);
const relayNoticeSchema = z.tuple([z.literal('NOTICE'), z.string()]);
const relayUnknownSchema = z.tuple([z.string()]).rest(z.unknown());

/** Relay message to a Nostr client. */
const relayMsgSchema = z.union([
  relayEventSchema,
  relayOkSchema,
  relayEoseSchema,
  relayNoticeSchema,
  relayUnknownSchema,
]);

/** EVENT message from relay to client. */
type RelayEVENT = z.infer<typeof relayEventSchema>;
/** OK message from relay to client. */
type RelayOK = z.infer<typeof relayOkSchema>;
/** EOSE message from relay to client. */
type RelayEOSE = z.infer<typeof relayEoseSchema>;
/** NOTICE message from relay to client. */
type RelayNOTICE = z.infer<typeof relayNoticeSchema>;
/** Relay message to a Nostr client. */
type RelayMsg = z.infer<typeof relayMsgSchema>;

export {
  nostrIdSchema,
  kindSchema,
  eventSchema,
  signedEventSchema,
  connectRequestSchema,
  relayMsgSchema,
  type RelayEVENT,
  type RelayOK,
  type RelayEOSE,
  type RelayNOTICE,
  type RelayMsg,
};