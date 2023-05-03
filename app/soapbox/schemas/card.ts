import punycode from 'punycode';

import { z } from 'zod';

import { groupSchema } from './group';

const IDNA_PREFIX = 'xn--';

/**
 * Card (aka link preview).
 * https://docs.joinmastodon.org/entities/card/
 */
const cardSchema = z.object({
  author_name: z.string().catch(''),
  author_url: z.string().url().catch(''),
  blurhash: z.string().nullable().catch(null),
  description: z.string().catch(''),
  embed_url: z.string().url().catch(''),
  group: groupSchema.nullable().catch(null), // TruthSocial
  height: z.number().catch(0),
  html: z.string().catch(''),
  image: z.string().nullable().catch(null),
  pleroma: z.object({
    opengraph: z.object({
      width: z.number(),
      height: z.number(),
      html: z.string(),
      thumbnail_url: z.string().url(),
    }).optional().catch(undefined),
  }).optional().catch(undefined),
  provider_name: z.string().catch(''),
  provider_url: z.string().url().catch(''),
  title: z.string().catch(''),
  type: z.enum(['link', 'photo', 'video', 'rich']).catch('link'),
  url: z.string().url(),
  width: z.number().catch(0),
}).transform(({ pleroma, ...card }) => {
  if (!card.provider_name) {
    card.provider_name = decodeIDNA(new URL(card.url).hostname);
  }

  if (pleroma?.opengraph) {
    if (!card.width && !card.height) {
      card.width = pleroma.opengraph.width;
      card.height = pleroma.opengraph.height;
    }

    if (!card.html) {
      card.html = pleroma.opengraph.html;
    }

    if (!card.image) {
      card.image = pleroma.opengraph.thumbnail_url;
    }
  }

  return card;
});

const decodeIDNA = (domain: string): string => {
  return domain
    .split('.')
    .map(part => part.indexOf(IDNA_PREFIX) === 0 ? punycode.decode(part.slice(IDNA_PREFIX.length)) : part)
    .join('.');
};

type Card = z.infer<typeof cardSchema>;

export { cardSchema, type Card };