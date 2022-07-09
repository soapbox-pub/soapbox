import { Index } from 'flexsearch';

import data from './data';

import type { Emoji } from './index';
// import type { Emoji as EmojiMart, CustomEmoji } from 'emoji-mart';

const index = new Index({
  tokenize: 'full',
  optimize: true,
  context: true,
});

for (const [key, emoji] of Object.entries(data.emojis)) {
  index.add(key, emoji.name);
}

export interface searchOptions {
  maxResults?: number;
  custom?: any,
}

export const addCustomToPool = (customEmojis: any[]) => {
  let i = 0;

  for (const emoji of customEmojis) {
    index.add(i++, emoji.id);
  }
};

const search = (str: string, { maxResults = 5, custom }: searchOptions = {}, custom_emojis?: any): Emoji[] => {
  return index.search(str, maxResults)
    .flatMap(id => {
      if (Number.isInteger(id)) {
        const { shortcode, static_url } = custom_emojis.get(id).toJS();

        return {
          id: shortcode,
          colons: ':' + shortcode + ':',
          custom: true,
          imageUrl: static_url,
        };
      }

      const { skins } = data.emojis[id];

      return {
        id: id as string,
        colons: ':' + id + ':',
        unified: skins[0].unified,
        native: skins[0].native,
      };
    });
};

export default search;
