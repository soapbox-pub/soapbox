import { Index } from 'flexsearch-ts';
import { Map as ImmutableMap, List as ImmutableList } from 'immutable';

import data from './data';

import type { Emoji } from './index';

const index = new Index({
  tokenize: 'full',
  optimize: true,
  context: true,
});

const sortedEmojis = Object.entries(data.emojis).sort((a, b) => a[0].localeCompare(b[0]));
for (const [key, emoji] of sortedEmojis) {
  index.add('n' + key, `${emoji.id} ${emoji.name} ${emoji.keywords.join(' ')}`);
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
const search = (
  str: string, { maxResults = 5 }: searchOptions = {},
  custom_emojis?: ImmutableList<ImmutableMap<string, string>>,
): Emoji[] => {
  return index.search(str, maxResults)
    .flatMap((id) => {
      if (typeof id !== 'string') return;

      if (id[0] === 'c' && custom_emojis) {
        const index = Number(id.slice(1));
        const custom = custom_emojis.get(index);

        if (custom) {
          return {
            id: custom.get('shortcode', ''),
            colons: ':' + custom.get('shortcode', '') + ':',
            custom: true,
            imageUrl: custom.get('static_url', ''),
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

export default search;
