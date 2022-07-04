import emojiData from './data';

import type EmojiData from '@emoji-mart/data';

interface IUniMap {
  [s: string]: {
    unified: string,
    shortcode: string,
  }
}

export const generateMappings = (data: typeof EmojiData): IUniMap => {
  const result = {};
  const emojis = Object.values(data.emojis ?? {});

  for (const value of emojis) {
    // @ts-ignore
    for (const item of value.skins) {
      const { unified, native } = item;

      // @ts-ignore
      result[native] = { unified, shortcode: value.id };
    }
  }

  return result;
};

const unicodeMapping = generateMappings(emojiData);

export default unicodeMapping;
