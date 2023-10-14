import React from 'react';

import { isCustomEmoji } from 'soapbox/features/emoji';

import type { Emoji } from 'soapbox/features/emoji';

interface IAutosuggestEmoji {
  emoji: Emoji;
}

const AutosuggestEmoji: React.FC<IAutosuggestEmoji> = ({ emoji }) => {
  let url, alt;

  if (isCustomEmoji(emoji)) {
    url = emoji.imgUrl;
    alt = emoji.colons;
  } else {
    const mapping = undefined;
    if (!mapping) {
      return null;
    }

    alt = emoji.native;
  }

  return (
    <div className='autosuggest-emoji' data-testid='emoji'>
      <img
        className='emojione'
        src={url}
        alt={alt}
      />

      {emoji.colons}
    </div>
  );
};

export default AutosuggestEmoji;
