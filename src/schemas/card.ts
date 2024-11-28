import punycode from 'punycode';

import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

import { groupSchema } from './group.ts';

const IDNA_PREFIX = 'xn--';

/** Special HTML parsing for link previews. */
const cardHtmlSchema = z.string().transform((value) => {
  const html = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ['iframe'],
    ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
    RETURN_DOM: true,
  });

  html.querySelectorAll('iframe').forEach((frame) => {
    try {
      const src = new URL(frame.src);
      if (src.protocol !== 'https:') {
        throw new Error('iframe must be https');
      }
      if (src.origin === location.origin) {
        throw new Error('iframe must not be same origin');
      }
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    } catch (e) {
      frame.remove();
    }
  });

  return { __html: html.innerHTML };
});

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
  html: cardHtmlSchema.catch({ __html: '' }),
  image: z.string().nullable().catch(null),
  pleroma: z.object({
    opengraph: z.object({
      width: z.number(),
      height: z.number(),
      html: cardHtmlSchema.catch({ __html: '' }),
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

    if (!card.html.__html) {
      card.html.__html = pleroma.opengraph.html.__html;
    }

    if (!card.image) {
      card.image = pleroma.opengraph.thumbnail_url;
    }
  }

  if (!card.html.__html) {
    card.type = 'link';
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