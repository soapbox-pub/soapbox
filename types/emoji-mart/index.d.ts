
declare module 'emoji-mart' {
  export interface NativeEmoji {
    unified: string,
    native: string,
    x: number,
    y: number,
  }

  export interface CustomEmoji {
    src: string
  }

  export interface Emoji<T> {
    id: string,
    name: string,
    keywords: string[],
    skins: T[],
    version?: number,
  }

  export interface PickerProps {
    custom?: { emojis: Emoji<CustomEmoji> }[],
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
    autoFocus?: boolean,
    i18n?: any,
  }

  export class Picker {

    constructor(props: PickerProps);

  }

}

declare module '@emoji-mart/data/sets/14/twitter.json' {
  export interface NativeEmoji {
    unified: string,
    native: string,
    x: number,
    y: number,
  }

  export interface CustomEmoji {
    src: string
  }

  export interface Emoji<T> {
    id: string,
    name: string,
    keywords: string[],
    skins: T[],
    version?: number,
  }

  export interface EmojiCategory {
    id: string,
    emojis: string[],
  }

  export interface EmojiMap {
    [s: string]: Emoji<NativeEmoji>,
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
