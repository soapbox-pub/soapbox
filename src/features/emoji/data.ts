import data from '@emoji-mart/data/sets/14/twitter.json';

export interface NativeEmoji {
  unified: string
  native: string
  x: number
  y: number
}

export interface CustomEmoji {
  src: string
}

export interface Emoji<T> {
  id: string
  name: string
  keywords: string[]
  skins: T[]
  version?: number
}

export interface EmojiCategory {
  id: string
  emojis: string[]
}

export interface EmojiMap {
  [s: string]: Emoji<NativeEmoji>
}

export interface EmojiAlias {
  [s: string]: string
}

export interface EmojiSheet {
  cols: number
  rows: number
}

export interface EmojiData {
  categories: EmojiCategory[]
  emojis: EmojiMap
  aliases: EmojiAlias
  sheet: EmojiSheet
}

const emojiData = data as EmojiData;
const { categories, emojis, aliases, sheet } = emojiData;

export { categories, emojis, aliases, sheet };

export default emojiData;
