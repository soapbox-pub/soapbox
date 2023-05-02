import clsx from 'clsx';
import React from 'react';

import { Text } from 'soapbox/components/ui';
import emojify from 'soapbox/features/emoji';
import { EmojiReaction } from 'soapbox/types/entities';

interface IChatMessageReaction {
  emojiReaction: EmojiReaction
  onRemoveReaction(emoji: string): void
  onAddReaction(emoji: string): void
}

const ChatMessageReaction = (props: IChatMessageReaction) => {
  const { emojiReaction, onAddReaction, onRemoveReaction } = props;

  const isAlreadyReacted = emojiReaction.me;

  const handleClick = () => {
    if (isAlreadyReacted) {
      onRemoveReaction(emojiReaction.name);
    } else {
      onAddReaction(emojiReaction.name);
    }
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className={
        clsx({
          'w-12 rounded-lg flex justify-between text-sm border items-center border-solid text-gray-700 dark:text-gray-600 px-2 py-1 space-x-1.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-800 whitespace-nowrap': true,
          'border-primary-500 dark:border-primary-400': emojiReaction.me,
          'border-gray-300 dark:border-gray-800': !emojiReaction.me,
        })
      }
    >
      <span dangerouslySetInnerHTML={{ __html: emojify(emojiReaction.name) }} />
      <Text tag='span' weight='medium' size='sm'>{emojiReaction.count}</Text>
    </button>
  );
};

export default ChatMessageReaction;
