// import data from '@emoji-mart/data';
import { load as cheerioLoad } from 'cheerio';
import { parseDocument } from 'htmlparser2';

import unicodeMapping from './mapping';

import type { Node as CheerioNode } from 'cheerio';
import type { Emoji as EmojiMart, CustomEmoji as EmojiMartCustom } from 'emoji-mart';

export interface Emoji {
  id: string,
  colons: string,
  custom?: boolean,
}

export interface CustomEmoji extends Emoji {
  custom: true,
  imageUrl: string, 
}

export interface NativeEmoji extends Emoji {
  unified: string,
  native: string,
}

export function isCustomEmoji(emoji: Emoji): emoji is CustomEmoji {
  return (emoji as CustomEmoji).imageUrl !== undefined;
}

export function isNativeEmoji(emoji: Emoji): emoji is NativeEmoji {
  return (emoji as NativeEmoji).native !== undefined;
}

// export type Emoji = any;

const isAlphaNumeric = (c: string) => {
  const code = c.charCodeAt(0);

  if (!(code > 47 && code < 58) &&  // numeric (0-9)
      !(code > 64 && code < 91) &&  // upper alpha (A-Z)
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

const convertEmoji = (str: string, customEmojis: any) => {
  if (str.length < 3) return str;
  if (str in customEmojis) {
    const emoji = customEmojis[str];
    const filename = emoji.static_url;

    if (filename?.length > 0) {
      return convertCustom(str, filename);
    }
  }

  return str;
};

const popStack = (stack: string, open: boolean) => {
  const ret = stack;
  open = false;
  stack = '';
  return ret;
};

// TODO: handle grouped unicode emojis
export const emojifyText = (str: string, customEmojis = {}) => {
  let res = '';
  let stack = '';
  let open = false;

  for (const c of Array.from(str)) { // chunk by unicode codepoint with Array.from
    if (c in unicodeMapping) {
      if (open) { // unicode emoji inside colon
        res += popStack(stack, open);
      }

      res += convertUnicode(c);

    } else if (c === ':') {
      stack += ':';

      // we see another : we convert it and clear the stack buffer
      if (open) {
        res += convertEmoji(stack, customEmojis);
        stack = '';
      }

      open = !open;
    } else {
      if (open) {
        stack += c;

        // if the stack is non-null and we see invalid chars it's a string not emoji
        // so we push it to the return result and clear it
        if (!validEmojiChar(c)) {
          res += popStack(stack, open);
        }
      } else {
        res += c;
      }
    }
  }

  // never found a closing colon so it's just a raw string
  if (open) {
    res += stack;
  }

  return res;
};

// const parseHmtl = (str: string) => {
//   const ret = [];
//   let depth = 0;
//
//   return ret;
// }

const filterTextNodes = (idx: number, el: CheerioNode) => {
  return el.nodeType === Node.TEXT_NODE;
};

const emojify = (str: string, customEmojis = {}) => {
  const dom = parseDocument(str);
  const $ = cheerioLoad(dom, {
    xmlMode: true,
    decodeEntities: false,
  });

  $.root()
    .contents() // iterate over flat map of all html elements
    .filter(filterTextNodes) // only iterate over text nodes
    .each((idx, el) => {
      // skip common case
      // @ts-ignore
      if (el.data.length === 0 || el.data === ' ') return;

      // mutating el.data is incorrect but we do it to prevent a second dom parse
      // @ts-ignore
      el.data = emojifyText(el.data, customEmojis);
    });

  return $.html();
};

export default emojify;

export const buildCustomEmojis = (customEmojis: any) => {
  const emojis: EmojiMart<EmojiMartCustom>[] = [];

  customEmojis.forEach((emoji: any) => {
    const shortcode = emoji.get('shortcode');
    const url       = emoji.get('static_url');
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
