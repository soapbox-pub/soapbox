import { z } from 'zod';

import { attachmentSchema } from './attachment';
import { cardSchema } from './card';
import { customEmojiSchema } from './custom-emoji';
import { contentSchema, emojiSchema, filteredArray } from './utils';

const chatMessageSchema = z.object({
  account_id: z.string(),
  media_attachments: filteredArray(attachmentSchema),
  card: cardSchema.nullable().catch(null),
  chat_id: z.string(),
  content: contentSchema,
  created_at: z.string().datetime().catch(new Date().toUTCString()),
  emojis: filteredArray(customEmojiSchema),
  expiration: z.number().optional().catch(undefined),
  emoji_reactions: z.array(emojiSchema).min(1).nullable().catch(null),
  id: z.string(),
  unread: z.coerce.boolean(),
  deleting: z.coerce.boolean(),
  pending: z.coerce.boolean(),
});

type ChatMessage = z.infer<typeof chatMessageSchema>;

export { chatMessageSchema, type ChatMessage };