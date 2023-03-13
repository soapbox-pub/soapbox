import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { Divider, HStack, Icon, Text } from 'soapbox/components/ui';
import { useFeatures } from 'soapbox/hooks';
import { usePendingGroups } from 'soapbox/queries/groups';

export default () => {
  const features = useFeatures();

  const { groups, isFetching } = usePendingGroups();

  if (!features.groupsPending || isFetching || groups.length === 0) {
    return null;
  }

  return (
    <>
      <Link to='/groups/pending-requests' className='group' data-testid='pending-groups-row'>
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
                values={{ number: groups.length }}
              />
            </Text>
          </HStack>

          <Icon
            src={require('@tabler/icons/chevron-right.svg')}
            className='h-5 w-5 text-gray-600 transition-colors group-hover:text-gray-700 dark:text-gray-600 dark:group-hover:text-gray-500'
          />
        </HStack>
      </Link>

      <Divider />
    </>
  );
};