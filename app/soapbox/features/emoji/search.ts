import { Index } from 'flexsearch';

import data from './data';

import type { Emoji, CustomEmoji } from 'emoji-mart';

const index = new Index({
  tokenize: 'forward',
  optimize: true,
});

for (const [key, emoji] of Object.entries(data.emojis)) {
  index.add(key, emoji.name);
}

export interface searchOptions {
  maxResults?: number;
}

export const addCustomToPool = (customEmojis: Emoji<CustomEmoji>[]) => {
  let i = 0;

  for (const emoji of customEmojis) {
    index.add(i++, emoji.id);
  }
};

const search = (str: string, options: searchOptions, custom_emojis: any) => {
  return index.search(str, options.maxResults)
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
