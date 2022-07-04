import React from 'react';

import type { Emoji } from 'soapbox/features/emoji';
import unicodeMapping from 'soapbox/features/emoji/mapping';
import { joinPublicPath } from 'soapbox/utils/static';

interface UnicodeMapping {
  filename: string,
}

interface IAutosuggestEmoji {
  emoji: Emoji,
}

const AutosuggestEmoji: React.FC<IAutosuggestEmoji> = ({ emoji }) => {
  let url;

  if (emoji.custom) {
    url = emoji.imageUrl;
  } else {
    const mapping = unicodeMapping[emoji.native] || unicodeMapping[emoji.native.replace(/\uFE0F$/, '')];

    if (!mapping) {
      return null;
    }

    url = joinPublicPath(`packs/emoji/${mapping.unified}.svg`);
  }

  return (
    <div className='autosuggest-emoji' data-testid='emoji'>
      <img
        className='emojione'
        src={url}
        alt={emoji.native || emoji.colons}
      />

      {emoji.colons}
    </div>
  );
};

export default AutosuggestEmoji;
