import React from 'react';
import { HotKeys } from 'react-hotkeys';
import { FormattedMessage } from 'react-intl';

import { Text } from 'soapbox/components/ui';

interface ITombstone {
  id: string
  onMoveUp: (statusId: string) => void
  onMoveDown: (statusId: string) => void
}

/** Represents a deleted item. */
const Tombstone: React.FC<ITombstone> = ({ id, onMoveUp, onMoveDown }) => {
  const handlers = {
    moveUp: () => onMoveUp(id),
    moveDown: () => onMoveDown(id),
  };

  return (
    <HotKeys handlers={handlers}>
      <div className='focusable flex items-center justify-center border border-solid border-gray-200 bg-gray-100 p-9 dark:border-gray-800 dark:bg-gray-900 sm:rounded-xl' tabIndex={0}>
        <Text>
          <FormattedMessage id='statuses.tombstone' defaultMessage='One or more posts are unavailable.' />
        </Text>
      </div>
    </HotKeys>
  );
};

export default Tombstone;
