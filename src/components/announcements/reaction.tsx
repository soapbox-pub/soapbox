import clsx from 'clsx';
import React, { useState } from 'react';

import { useAnnouncements } from 'soapbox/api/hooks/announcements';
import AnimatedNumber from 'soapbox/components/animated-number';
import unicodeMapping from 'soapbox/features/emoji/mapping';

import Emoji from './emoji';

import type { Map as ImmutableMap } from 'immutable';
import type { AnnouncementReaction } from 'soapbox/schemas';

interface IReaction {
  announcementId: string;
  reaction: AnnouncementReaction;
  emojiMap: ImmutableMap<string, ImmutableMap<string, string>>;
  style: React.CSSProperties;
}

const Reaction: React.FC<IReaction> = ({ announcementId, reaction, emojiMap, style }) => {
  const [hovered, setHovered] = useState(false);

  const { addReaction, removeReaction } = useAnnouncements();

  const handleClick = () => {
    if (reaction.me) {
      removeReaction({ announcementId, name: reaction.name });
    } else {
      addReaction({ announcementId, name: reaction.name });
    }
  };

  const handleMouseEnter = () => setHovered(true);

  const handleMouseLeave = () => setHovered(false);

  let shortCode = reaction.name;

  // @ts-ignore
  if (unicodeMapping[shortCode]) {
    // @ts-ignore
    shortCode = unicodeMapping[shortCode].shortCode;
  }

  return (
    <button
      className={clsx('flex shrink-0 items-center gap-1.5 rounded-sm bg-gray-100 px-1.5 py-1 transition-colors dark:bg-primary-900', {
        'bg-gray-200 dark:bg-primary-800': hovered,
        'bg-primary-200 dark:bg-primary-500': reaction.me,
      })}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={`:${shortCode}:`}
      style={style}
    >
      <span className='block h-4 w-4'>
        <Emoji hovered={hovered} emoji={reaction.name} emojiMap={emojiMap} />
      </span>
      <span className='block min-w-[9px] text-center text-xs font-medium text-primary-600 dark:text-white'>
        <AnimatedNumber value={reaction.count} />
      </span>
    </button>
  );
};

export default Reaction;
