import chevronRightIcon from '@tabler/icons/outline/chevron-right.svg';
import exclamationCircleIcon from '@tabler/icons/outline/exclamation-circle.svg';
import clsx from 'clsx';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';

interface IPendingItemsRow {
  /** Path to navigate the user when clicked. */
  to: string;
  /** Number of pending items. */
  count: number;
  /** Size of the icon. */
  size?: 'md' | 'lg';
}

const PendingItemsRow: React.FC<IPendingItemsRow> = ({ to, count, size = 'md' }) => {
  return (
    <Link to={to} className='group' data-testid='pending-items-row'>
      <HStack alignItems='center' justifyContent='between'>
        <HStack alignItems='center' space={2}>
          <div className={clsx('rounded-full bg-primary-200 text-primary-500 dark:bg-primary-800 dark:text-primary-200', {
            'p-3': size === 'lg',
            'p-2.5': size === 'md',
          })}
          >
            <Icon
              src={exclamationCircleIcon}
              className={clsx({
                'h-5 w-5': size === 'md',
                'h-7 w-7': size === 'lg',
              })}
            />
          </div>

          <Text weight='bold' size='md'>
            <FormattedMessage
              id='groups.pending.count'
              defaultMessage='{number, plural, one {# pending request} other {# pending requests}}'
              values={{ number: count }}
            />
          </Text>
        </HStack>

        <Icon
          src={chevronRightIcon}
          className='size-5 text-gray-600 transition-colors group-hover:text-gray-700 dark:text-gray-600 dark:group-hover:text-gray-500'
        />
      </HStack>
    </Link>
  );
};

export { PendingItemsRow };