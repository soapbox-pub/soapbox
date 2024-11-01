import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Text } from 'soapbox/components/ui';
import { HotKeys } from 'soapbox/features/ui/components/hotkeys';

interface ITombstone {
  id: string;
  onMoveUp?: (statusId: string) => void;
  onMoveDown?: (statusId: string) => void;
}

/** Represents a deleted item. */
const Tombstone: React.FC<ITombstone> = ({ id, onMoveUp, onMoveDown }) => {
  const handlers = {
    moveUp: () => onMoveUp?.(id),
    moveDown: () => onMoveDown?.(id),
  };

  return (
    <HotKeys handlers={handlers}>
      <div className='h-16'>
        <div
          className='flex h-[42px] items-center justify-center rounded-lg border-2 border-gray-200 text-center focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-gray-800'
        >
          <Text theme='muted'>
            <FormattedMessage
              id='statuses.tombstone'
              defaultMessage='One or more posts are unavailable.'
            />
          </Text>
        </div>
      </div>
    </HotKeys>
  );
};

export default Tombstone;
