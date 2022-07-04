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

declare module '@emoji-mart/data' {
  interface EmojiData {
    emojis: {
      [s: string]: {
        skins: { unified: string, native: string }[],
      }
    }
  }

  export const emojis: Emojidata;
}
