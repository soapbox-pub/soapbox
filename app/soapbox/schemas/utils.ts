import z from 'zod';

import type { CustomEmoji } from './custom-emoji';

/** Validates individual items in an array, dropping any that aren't valid. */
function filteredArray<T extends z.ZodTypeAny>(schema: T) {
  return z.any().array().transform((arr) => (
    arr.map((item) => schema.safeParse(item).success ? item as z.infer<T> : undefined)
      .filter((item): item is z.infer<T> => Boolean(item))
  ));
}

/** Map a list of CustomEmoji to their shortcodes. */
function makeCustomEmojiMap(customEmojis: CustomEmoji[]) {
  return customEmojis.reduce<Record<string, CustomEmoji>>((result, emoji) => {
    result[`:${emoji.shortcode}:`] = emoji;
    return result;
  }, {});
}

export { filteredArray, makeCustomEmojiMap };