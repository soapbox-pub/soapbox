import z from 'zod';

/**
 * Represents a custom emoji.
 * https://docs.joinmastodon.org/entities/CustomEmoji/
 */
const customEmojiSchema = z.object({
  category: z.string().catch(''),
  shortcode: z.string(),
  static_url: z.string().catch(''),
  url: z.string(),
  visible_in_picker: z.boolean().catch(true),
});

type CustomEmoji = z.infer<typeof customEmojiSchema>;

export { customEmojiSchema, type CustomEmoji };
