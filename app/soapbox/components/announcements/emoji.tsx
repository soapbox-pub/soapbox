import React from 'react';

import unicodeMapping from 'soapbox/features/emoji/mapping';
import { useSettings } from 'soapbox/hooks';
import { joinPublicPath } from 'soapbox/utils/static';

import type { Map as ImmutableMap } from 'immutable';

interface IEmoji {
  emoji: string
  emojiMap: ImmutableMap<string, ImmutableMap<string, string>>
  hovered: boolean
}

const Emoji: React.FC<IEmoji> = ({ emoji, emojiMap, hovered }) => {
  const autoPlayGif = useSettings().get('autoPlayGif');

  // @ts-ignore
  if (unicodeMapping[emoji]) {
    // @ts-ignore
    const { filename, shortCode } = unicodeMapping[emoji];
    const title = shortCode ? `:${shortCode}:` : '';

    return (
      <img
        draggable='false'
        className='emojione m-0 block'
        alt={emoji}
        title={title}
        src={joinPublicPath(`packs/emoji/${filename}.svg`)}
      />
    );
  } else if (emojiMap.get(emoji as any)) {
    const filename  = (autoPlayGif || hovered) ? emojiMap.getIn([emoji, 'url']) : emojiMap.getIn([emoji, 'static_url']);
    const shortCode = `:${emoji}:`;

    return (
      <img
        draggable='false'
        className='emojione m-0 block'
        alt={shortCode}
        title={shortCode}
        src={filename as string}
      />
    );
  } else {
    return null;
  }
};

export default Emoji;
