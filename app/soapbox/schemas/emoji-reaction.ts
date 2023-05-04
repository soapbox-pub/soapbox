import { z } from 'zod';

import { emojiSchema } from './utils';

/** Pleroma emoji reaction. */
const emojiReactionSchema = z.object({
  name: emojiSchema,
  count: z.number().nullable().catch(null),
  me: z.boolean().catch(false),
});

type EmojiReaction = z.infer<typeof emojiReactionSchema>;

export { emojiReactionSchema, type EmojiReaction };