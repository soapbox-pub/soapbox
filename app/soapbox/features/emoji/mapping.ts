import data, { EmojiData } from './data';

interface UnicodeMap {
  [s: string]: {
    unified: string,
    shortcode: string,
  }
}

export const generateMappings = (data: EmojiData): UnicodeMap => {
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

const unicodeMapping = generateMappings(data);

export default unicodeMapping;
