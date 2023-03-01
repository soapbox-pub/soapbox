import { Index } from 'flexsearch';

import data from './data';

import type { Emoji } from './index';
// import type { Emoji as EmojiMart, CustomEmoji } from 'emoji-mart';

// @ts-ignore
const index = new Index({
  tokenize: 'full',
  optimize: true,
  context: true,
});

for (const [key, emoji] of Object.entries(data.emojis)) {
  index.add('n' + key, emoji.name);
}

export interface searchOptions {
  maxResults?: number
  custom?: any
}

export const addCustomToPool = (customEmojis: any[]) => {
  // @ts-ignore
  for (const key in index.register) {
    if (key[0] === 'c') {
      index.remove(key); // remove old custom emojis
    }
  }

  let i = 0;

  for (const emoji of customEmojis) {
    index.add('c' + i++, emoji.id);
  }
};

// we can share an index by prefixing custom emojis with 'c' and native with 'n'
const search = (str: string, { maxResults = 5, custom }: searchOptions = {}, custom_emojis?: any): Emoji[] => {
  return index.search(str, maxResults)
    .flatMap((id: string) => {
      if (id[0] === 'c') {
        const { shortcode, static_url } = custom_emojis.get((id as string).slice(1)).toJS();

        return {
          id: shortcode,
          colons: ':' + shortcode + ':',
          custom: true,
          imageUrl: static_url,
        };
      }

      const { skins } = data.emojis[(id as string).slice(1)];

      return {
        id: (id as string).slice(1),
        colons: ':' + id.slice(1) + ':',
        unified: skins[0].unified,
        native: skins[0].native,
      };
    });
};

export default search;
