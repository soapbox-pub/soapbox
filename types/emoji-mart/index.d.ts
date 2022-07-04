declare module 'emoji-mart' {
  export interface EmojiSkin {
    src: string
  }

  export interface Emoji {
    id: string,
    name: string,
    keywords: string[],
    skins: EmojiSkin[],
  }

  export interface PickerProps {
    custom?: { emojis: Emoji[] }[],
    set?: string,
    title?: string,
    theme?: string,
    onEmojiSelect?: any,
    recent?: any,
    skin?: any,
    perLine?: number,
    emojiSize?: number,
    emojiButtonSize?: number,
    navPosition?: string,
    set?: string,
    theme?: string,
    autoFocus?: boolean,
    i18n?: any,
  }

  export class Picker {

    constructor(props: PickerProps);

  }

}

declare module '@emoji-mart/data/sets/14/twitter.json' {
  export interface EmojiSkin {
    unified: string,
    native: string,
    x: number,
    y: number,
  }

  export interface EmojiCategory {
    id: string,
    emojis: string[],
  }

  export interface Emoji {
    id: string,
    name: string,
    keywords: string[],
    skins: EmojiSkin[],
    version: number,
  }

  export interface EmojiMap {
    [s: string]: Emoji,
  }

  export interface EmojiAlias {
    [s: string]: string,
  }

  export interface EmojiSheet {
    cols: number,
    rows: number,
  }

  export interface EmojiData {
    categories: EmojiCategory[],
    emojis: EmojiMap,
    aliases: EmojiAlias,
    sheet: EmojiSheet,
  }

  const data: EmojiData;

  export default data;

}
