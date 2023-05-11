import escapeTextContentForBrowser from 'escape-html';
import { z } from 'zod';

import emojify from 'soapbox/features/emoji';
import { stripCompatibilityFeatures } from 'soapbox/utils/html';

import { accountSchema } from './account';
import { attachmentSchema } from './attachment';
import { cardSchema } from './card';
import { customEmojiSchema } from './custom-emoji';
import { groupSchema } from './group';
import { mentionSchema } from './mention';
import { pollSchema } from './poll';
import { tagSchema } from './tag';
import { contentSchema, dateSchema, filteredArray, makeCustomEmojiMap } from './utils';

const tombstoneSchema = z.object({
  reason: z.enum(['deleted']),
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
  pleroma: z.object({}).optional().catch(undefined),
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
  tombstone: tombstoneSchema.nullable().optional(),
  uri: z.string().url().catch(''),
  url: z.string().url().catch(''),
  visibility: z.string().catch('public'),
});

const statusSchema = baseStatusSchema.extend({
  quote: baseStatusSchema.nullable().catch(null),
  reblog: baseStatusSchema.nullable().catch(null),
}).transform((status) => {
  const emojiMap = makeCustomEmojiMap(status.emojis);

  const contentHtml = stripCompatibilityFeatures(emojify(status.content, emojiMap));
  const spoilerHtml = emojify(escapeTextContentForBrowser(status.spoiler_text), emojiMap);

  return {
    ...status,
    contentHtml,
    spoilerHtml,
  };
});

type Status = z.infer<typeof statusSchema>;

export { statusSchema, type Status };