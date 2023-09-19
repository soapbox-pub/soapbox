import z from 'zod';

import type { CustomEmoji } from './custom-emoji';

/** Ensure HTML content is a string, and drop empty `<p>` tags. */
const contentSchema = z.string().catch('').transform((value) => value === '<p></p>' ? '' : value);

/** Validate to Mastodon's date format, or use the current date. */
const dateSchema = z.string().datetime().catch(new Date().toUTCString());

/** Validates individual items in an array, dropping any that aren't valid. */
function filteredArray<T extends z.ZodTypeAny>(schema: T) {
  return z.any().array().catch([])
    .transform((arr) => (
      arr.map((item) => {
        const parsed = schema.safeParse(item);
        return parsed.success ? parsed.data : undefined;
      }).filter((item): item is z.infer<T> => Boolean(item))
    ));
}

/** Validates the string as an emoji. */
const emojiSchema = z.string().refine((v) => /\p{Extended_Pictographic}/u.test(v));

/** Map a list of CustomEmoji to their shortcodes. */
function makeCustomEmojiMap(customEmojis: CustomEmoji[]) {
  return customEmojis.reduce<Record<string, CustomEmoji>>((result, emoji) => {
    result[`:${emoji.shortcode}:`] = emoji;
    return result;
  }, {});
}

const jsonSchema = z.string().transform((value, ctx) => {
  try {
    return JSON.parse(value) as unknown;
  } catch (_e) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid JSON' });
    return z.NEVER;
  }
});

export { filteredArray, makeCustomEmojiMap, emojiSchema, contentSchema, dateSchema, jsonSchema };