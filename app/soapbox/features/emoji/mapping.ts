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

const blacklist = {
  '1f441-fe0f-200d-1f5e8-fe0f': true,
};

const tweaks = {
  '👁‍🗨️': ['1f441-200d-1f5e8', 'eye-in-speech-bubble'],
  '#⃣': ['23-20e3', 'hash'],
  '*⃣': ['2a-20e3', 'keycap_star'],
  '0⃣': ['30-20e3', 'zero'],
  '1⃣': ['31-20e3', 'one'],
  '2⃣': ['32-20e3', 'two'],
  '3⃣': ['33-20e3', 'three'],
  '4⃣': ['34-20e3', 'four'],
  '5⃣': ['35-20e3', 'five'],
  '6⃣': ['36-20e3', 'six'],
  '7⃣': ['37-20e3', 'seven'],
  '8⃣': ['38-20e3', 'eight'],
  '9⃣': ['39-20e3', 'nine'],
  '🏳‍🌈': ['1f3f3-fe0f-200d-1f308', 'rainbow-flag'],
  '🏳‍⚧️': ['1f3f3-fe0f-200d-26a7-fe0f', 'transgender_flag'],
  // '🏳️‍⚧️': ['1f3f3-fe0f-200d-26a7-fe0f'],
  '🏳‍⚧': ['1f3f3-fe0f-200d-26a7-fe0f', 'transgender_flag'],
};

export const generateMappings = (data: EmojiData): UnicodeMap => {
  const result = {};
  const emojis = Object.values(data.emojis ?? {});

  for (const value of emojis) {
    // @ts-ignore
    for (const item of value.skins) {
      const { unified, native } = item;
      const stripped = unified.replace(stripLeadingZeros, '');

      if (unified.includes('200d') && !(unified in blacklist)) {
        // @ts-ignore
        result[native] = { unified: stripped, shortcode: value.id };
      } else {
        const twemojiCode  = replaceAll(stripped, '-fe0f', '');

        // @ts-ignore
        result[native] = { unified: twemojiCode, shortcode: value.id };
      }
    }
  }

  for (const [key, value] of Object.entries(tweaks)) {
    // @ts-ignore
    result[key] = { unified: value[0], shortcode: value[1] };
  }

  return result;
};

const unicodeMapping = generateMappings(data);

export default unicodeMapping;
