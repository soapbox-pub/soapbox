import { FormattedMessage } from 'react-intl';

import { Text } from 'soapbox/components/ui/index.ts';
import { HotKeys } from 'soapbox/features/ui/components/hotkeys.tsx';

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
          className='focusable flex h-[42px] items-center justify-center rounded-lg border-2 border-gray-200 text-center dark:border-gray-800'
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
