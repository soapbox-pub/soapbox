import data, { EmojiData } from './data';

const stripLeadingZeros = /^0+/;

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find, 'g'), replace);
}

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
      const stripped = unified.replace(stripLeadingZeros, '');

      if (unified.includes('200d') && unified !== '1f441-fe0f-200d-1f5e8-fe0f') {
        // @ts-ignore
        result[native] = { unified: stripped, shortcode: value.id };
      } else {
        const twemojiCode  = replaceAll(stripped, '-fe0f', '');

        // @ts-ignore
        result[native] = { unified: twemojiCode, shortcode: value.id };
      }
    }
  }

  return result;
};

const unicodeMapping = generateMappings(data);

export default unicodeMapping;
