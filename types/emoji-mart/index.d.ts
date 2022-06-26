declare module 'emoji-mart' {
  export type PickerProps = {
    custom?: { emojis: any[] }[],
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
