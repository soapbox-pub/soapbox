import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { HStack, Icon, Text } from 'soapbox/components/ui';

interface IPendingItemsRow {
  /** Path to navigate the user when clicked. */
  to: string
  /** Number of pending items. */
  count: number
}

const PendingItemsRow: React.FC<IPendingItemsRow> = ({ to, count }) => {
  return (
    <Link to={to} className='group'>
      <HStack alignItems='center' justifyContent='between'>
        <HStack alignItems='center' space={2}>
          <div className='rounded-full bg-primary-200 p-3 text-primary-500 dark:bg-primary-800 dark:text-primary-200'>
            <Icon
              src={require('@tabler/icons/exclamation-circle.svg')}
              className='h-7 w-7'
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
          src={require('@tabler/icons/chevron-right.svg')}
          className='h-5 w-5 text-gray-600 transition-colors group-hover:text-gray-700 dark:text-gray-600 dark:group-hover:text-gray-500'
        />
      </HStack>
    </Link>
  );
};

export { PendingItemsRow };