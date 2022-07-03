import data from '@emoji-mart/data';
import { load as cheerioLoad } from 'cheerio';
import { parseDocument } from 'htmlparser2';

import type EmojiData from '@emoji-mart/data';
import type { Node as CheerioNode } from 'cheerio';

interface IUniMap {
  [s: string]: {
    unified: string,
    shortcode: string,
  }
}

const generateMappings = (data: typeof EmojiData): IUniMap => {
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

const isAlphaNumeric = (c: string) => {
  const code = c.charCodeAt(0);

  if (!(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)) { // lower alpha (a-z)
    return false;
  } else {
    return true;
  }
};

const validEmojiChar = (c: string) => {
  return isAlphaNumeric(c)
    || c === '_'
    || c === '-';
};

const convertCustom = (shortname: string, filename: string) => {
  return `<img draggable="false" class="emojione" alt="${shortname}" title="${shortname}" src="${filename}" />`;
};

const convertUnicode = (c: string) => {
  const { unified, shortcode } = unicodeMapping[c];

  return `<img draggable="false" class="emojione" alt="${c}" title=":${shortcode}:" src="/packs/emoji/${unified}.svg">`;
};

const convertEmoji = (str: string, customEmojis: any, autoplay: boolean) => {
  if (str in customEmojis) {
    const emoji = customEmojis[str];
    const filename = autoplay ? emoji.url : emoji.static_url;

    if (filename?.length > 0) {
      return convertCustom(str, filename);
    } else {
      return str;
    }
  } else {
    return str;
  }
};

const popStack = (stack: string, open: boolean, res: string) => {
  res += stack;
  open = false;
  stack = '';
};

const transmogrify = (str: string, customEmojis = {}, autoplay: boolean) => {
  let res = '';
  let stack = '';
  let open = false;

  for (const c of Array.from(str)) { // Array.from respects unicode
    if (c in unicodeMapping) {
      if (open) { // unicode emoji inside colon
        popStack(stack, open, res);
      }

      res += convertUnicode(c);
    } else if (c === ':') {
      stack += ':';

      if (open) {
        res += convertEmoji(stack, customEmojis, autoplay);
        stack = '';
      }

      open = !open;
    } else {
      if (open) {
        stack += c;

        if (!validEmojiChar(c)) {
          popStack(stack, open, res);
        }
      } else {
        res += c;
      }
    }
  }

  return res;
};

const filterTextNodes = (idx: number, el: CheerioNode) => {
  return el.nodeType === Node.TEXT_NODE;
};

const emojify = (str: string | any, customEmojis = {}, autoplay = false) => {
  const dom = parseDocument(str);
  const $ = cheerioLoad(dom, {
    xmlMode: true,
    decodeEntities: false,
  });

  $.root()
    .contents()
    .filter(filterTextNodes)
    .each((idx, el) => {
      // @ts-ignore
      if (el.data.length < 3) return;

      // mutating el.data is incorrect but we do it to prevent a second dom parse
      // @ts-ignore
      el.data = transmogrify(el.data, customEmojis, autoplay);
    });

  return $.html();
};

export default emojify;

export const buildCustomEmojis = (customEmojis: any, autoplay = false) => {
  const emojis: any[] = [];

  customEmojis.forEach((emoji: any) => {
    const shortcode = emoji.get('shortcode');
    const url       = autoplay ? emoji.get('url') : emoji.get('static_url');
    const name      = shortcode.replace(':', '');

    emojis.push({
      id: name,
      name,
      keywords: [name],
      skins: [{ src: url }],
    });
  });

  return emojis;
};
