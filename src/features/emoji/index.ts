import type { Emoji as EmojiMart, CustomEmoji as EmojiMartCustom } from 'soapbox/features/emoji/data.ts';
import type { CustomEmoji as MastodonCustomEmoji } from 'soapbox/schemas/custom-emoji.ts';

/*
 * TODO: Consolate emoji object types
 *
 * There are five different emoji objects currently
 *  - emoji-mart's "onPickEmoji" handler
 *  - emoji-mart's custom emoji types
 *  - an Emoji type that is either NativeEmoji or CustomEmoji
 *  - a type inside redux's `store.custom_emoji` immutablejs
 *
 * there needs to be one type for the picker handler callback
 * and one type for the emoji-mart data
 * and one type that is used everywhere that the above two are converted into
 */

export interface CustomEmoji {
  id: string;
  colons: string;
  custom: true;
  imageUrl: string;
}

export interface NativeEmoji {
  id: string;
  colons: string;
  custom?: false;
  unified: string;
  native: string;
}

export type Emoji = CustomEmoji | NativeEmoji;

export function isCustomEmoji(emoji: Emoji): emoji is CustomEmoji {
  return (emoji as CustomEmoji).imageUrl !== undefined;
}

export function isNativeEmoji(emoji: Emoji): emoji is NativeEmoji {
  return (emoji as NativeEmoji).native !== undefined;
}

export const parseHTML = (str: string): { text: boolean; data: string }[] => {
  const tokens = [];
  let buf = '';
  let stack = '';
  let open = false;

  for (const c of str) {
    if (c === '<') {
      if (open) {
        tokens.push({ text: true, data: stack });
        stack = '<';
      } else {
        tokens.push({ text: true, data: buf });
        stack = '<';
        open = true;
      }
    } else if (c === '>') {
      if (open) {
        open = false;
        tokens.push({ text: false, data: stack + '>' });
        stack = '';
        buf = '';
      } else {
        buf += '>';
      }

    } else {
      if (open) {
        stack += c;
      } else {
        buf += c;
      }
    }
  }

  if (open) {
    tokens.push({ text: true, data: buf + stack });
  } else if (buf !== '') {
    tokens.push({ text: true, data: buf });
  }

  return tokens;
};

export function buildCustomEmojis(customEmojis: MastodonCustomEmoji[]): EmojiMart<EmojiMartCustom>[] {
  const emojis: EmojiMart<EmojiMartCustom>[] = [];

  customEmojis.forEach((emoji) => {
    const shortcode = emoji.shortcode;
    const url = emoji.url;
    const name = shortcode.replace(':', '');

    emojis.push({
      id: name,
      name,
      keywords: [name],
      skins: [{ src: url }],
    });
  });

  return emojis;
}
