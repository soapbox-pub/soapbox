// @ts-ignore
import Index from '@akryum/flexsearch-es';

import data, { Emoji as EmojiMart, CustomEmoji as EmojiMartCustom } from 'soapbox/features/emoji/data.ts';
import { CustomEmoji } from 'soapbox/schemas/custom-emoji.ts';

import { buildCustomEmojis, type Emoji } from './index.ts';

// @ts-ignore Wrong default export.
const index: Index.Index = new Index({
  tokenize: 'full',
  optimize: true,
  context: true,
});

const sortedEmojis = Object.entries(data.emojis).sort((a, b) => a[0].localeCompare(b[0]));
for (const [key, emoji] of sortedEmojis) {
  index.add('n' + key, `${emoji.id} ${emoji.name} ${emoji.keywords.join(' ')}`);
}

export interface searchOptions {
  maxResults?: number;
  custom?: any;
}

export function addCustomToPool(customEmojis: EmojiMart<EmojiMartCustom>[]): void {
  for (const key in index.register) {
    if (key[0] === 'c') {
      index.remove(key); // remove old custom emojis
    }
  }

  let i = 0;

  for (const emoji of customEmojis) {
    index.add('c' + i++, emoji.id);
  }
}

// we can share an index by prefixing custom emojis with 'c' and native with 'n'
const search = (
  str: string, { maxResults = 5 }: searchOptions = {},
  customEmojis?: CustomEmoji[],
): Emoji[] => {
  return index.search(str, maxResults)
    .flatMap((id: any) => {
      if (typeof id !== 'string') return;

      if (id[0] === 'c' && customEmojis) {
        const index = Number(id.slice(1));
        const custom = customEmojis[index];

        if (custom) {
          return {
            id: custom.shortcode,
            colons: ':' + custom.shortcode + ':',
            custom: true,
            imageUrl: custom.url,
          };
        }
      }

      const skins = data.emojis[id.slice(1)]?.skins;

      if (skins) {
        return {
          id: id.slice(1),
          colons: ':' + id.slice(1) + ':',
          unified: skins[0].unified,
          native: skins[0].native,
        };
      }
    }).filter(Boolean) as Emoji[];
};

/** Import Mastodon custom emojis as emoji mart custom emojis. */
export function autosuggestPopulate(emojis: CustomEmoji[]) {
  addCustomToPool(buildCustomEmojis(emojis));
}

export default search;
