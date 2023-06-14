import escapeTextContentForBrowser from 'escape-html';
import { z } from 'zod';

import emojify from 'soapbox/features/emoji';
import { stripCompatibilityFeatures, unescapeHTML } from 'soapbox/utils/html';

import { accountSchema } from './account';
import { attachmentSchema } from './attachment';
import { cardSchema } from './card';
import { customEmojiSchema } from './custom-emoji';
import { emojiReactionSchema } from './emoji-reaction';
import { eventSchema } from './event';
import { groupSchema } from './group';
import { mentionSchema } from './mention';
import { pollSchema } from './poll';
import { tagSchema } from './tag';
import { contentSchema, dateSchema, filteredArray, makeCustomEmojiMap } from './utils';

import type { Resolve } from 'soapbox/utils/types';

const statusPleromaSchema = z.object({
  emoji_reactions: filteredArray(emojiReactionSchema),
  event: eventSchema.nullish().catch(undefined),
  quote: z.literal(null).catch(null),
  quote_visible: z.boolean().catch(true),
});

const baseStatusSchema = z.object({
  account: accountSchema,
  application: z.object({
    name: z.string(),
    website: z.string().url().nullable().catch(null),
  }).nullable().catch(null),
  bookmarked: z.coerce.boolean(),
  card: cardSchema.nullable().catch(null),
  content: contentSchema,
  created_at: dateSchema,
  disliked: z.coerce.boolean(),
  dislikes_count: z.number().catch(0),
  edited_at: z.string().datetime().nullable().catch(null),
  emojis: filteredArray(customEmojiSchema),
  favourited: z.coerce.boolean(),
  favourites_count: z.number().catch(0),
  group: groupSchema.nullable().catch(null),
  in_reply_to_account_id: z.string().nullable().catch(null),
  in_reply_to_id: z.string().nullable().catch(null),
  id: z.string(),
  language: z.string().nullable().catch(null),
  media_attachments: filteredArray(attachmentSchema),
  mentions: filteredArray(mentionSchema),
  muted: z.coerce.boolean(),
  pinned: z.coerce.boolean(),
  pleroma: statusPleromaSchema.optional().catch(undefined),
  poll: pollSchema.nullable().catch(null),
  quote: z.literal(null).catch(null),
  quotes_count: z.number().catch(0),
  reblog: z.literal(null).catch(null),
  reblogged: z.coerce.boolean(),
  reblogs_count: z.number().catch(0),
  replies_count: z.number().catch(0),
  sensitive: z.coerce.boolean(),
  spoiler_text: contentSchema,
  tags: filteredArray(tagSchema),
  tombstone: z.object({
    reason: z.enum(['deleted']),
  }).nullable().optional().catch(undefined),
  uri: z.string().url().catch(''),
  url: z.string().url().catch(''),
  visibility: z.string().catch('public'),
});

type BaseStatus = z.infer<typeof baseStatusSchema>;
type TransformableStatus = Omit<BaseStatus, 'reblog' | 'quote' | 'pleroma'> & {
  pleroma?: Omit<z.infer<typeof statusPleromaSchema>, 'quote'>
};

/** Creates search index from the status. */
const buildSearchIndex = (status: TransformableStatus): string => {
  const pollOptionTitles = status.poll ? status.poll.options.map(({ title }) => title) : [];
  const mentionedUsernames = status.mentions.map(({ acct }) => `@${acct}`);

  const fields = [
    status.spoiler_text,
    status.content,
    ...pollOptionTitles,
    ...mentionedUsernames,
  ];

  const searchContent = unescapeHTML(fields.join('\n\n')) || '';
  return new DOMParser().parseFromString(searchContent, 'text/html').documentElement.textContent || '';
};

type Translation = {
  content: string
  provider: string
}

/** Add internal fields to the status. */
const transformStatus = <T extends TransformableStatus>({ pleroma, ...status }: T) => {
  const emojiMap = makeCustomEmojiMap(status.emojis);

  const contentHtml = stripCompatibilityFeatures(emojify(status.content, emojiMap));
  const spoilerHtml = emojify(escapeTextContentForBrowser(status.spoiler_text), emojiMap);

  return {
    ...status,
    approval_status: 'approval' as const,
    contentHtml,
    expectsCard: false,
    event: pleroma?.event,
    filtered: [],
    hidden: false,
    pleroma: pleroma ? (() => {
      const { event, ...rest } = pleroma;
      return rest;
    })() : undefined,
    search_index: buildSearchIndex(status),
    showFiltered: false, // TODO: this should be removed from the schema and done somewhere else
    spoilerHtml,
    translation: undefined as Translation | undefined,
  };
};

const embeddedStatusSchema = baseStatusSchema
  .transform(transformStatus)
  .nullable()
  .catch(null);

const statusSchema = baseStatusSchema.extend({
  quote: embeddedStatusSchema,
  reblog: embeddedStatusSchema,
  pleroma: statusPleromaSchema.extend({
    quote: embeddedStatusSchema,
  }).optional().catch(undefined),
}).transform(({ pleroma, ...status }) => {
  return {
    ...status,
    event: pleroma?.event,
    quote: pleroma?.quote || status.quote || null,
    // There's apparently no better way to do this...
    // Just trying to remove the `event` and `quote` keys from the object.
    pleroma: pleroma ? (() => {
      const { event, quote, ...rest } = pleroma;
      return rest;
    })() : undefined,
  };
}).transform(transformStatus);

type Status = Resolve<z.infer<typeof statusSchema>>;

export { statusSchema, type Status };