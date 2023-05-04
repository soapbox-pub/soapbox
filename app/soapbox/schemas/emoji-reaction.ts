import { z } from 'zod';

/** Validates the string as an emoji. */
const emojiSchema = z.string().refine((v) => /\p{Extended_Pictographic}/u.test(v));

/** Pleroma emoji reaction. */
const emojiReactionSchema = z.object({
  name: emojiSchema,
  count: z.number().nullable().catch(null),
  me: z.boolean().catch(false),
});

type EmojiReaction = z.infer<typeof emojiReactionSchema>;

export { emojiReactionSchema, EmojiReaction };