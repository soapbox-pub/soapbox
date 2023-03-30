import React from 'react';
import { FormattedMessage } from 'react-intl';

import { HStack, Icon, Popover, Stack, Text } from 'soapbox/components/ui';
import { Group } from 'soapbox/types/entities';

interface IGroupPolicy {
  group: Group
}

const GroupPrivacy = ({ group }: IGroupPolicy) => (
  <Popover
    referenceElementClassName='cursor-help'
    content={
      <Stack space={4} alignItems='center' className='w-72'>
        <div className='rounded-full bg-gray-200 p-3 dark:bg-gray-800'>
          <Icon
            src={
              group.locked
                ? require('@tabler/icons/lock.svg')
                : require('@tabler/icons/world.svg')
            }
            className='h-6 w-6 text-gray-600 dark:text-gray-600'
          />
        </div>

        <Stack space={1} alignItems='center'>
          <Text size='lg' weight='bold' align='center'>
            {group.locked ? (
              <FormattedMessage id='group.privacy.locked.full' defaultMessage='Private Group' />
            ) : (
              <FormattedMessage id='group.privacy.public.full' defaultMessage='Public Group' />
            )}
          </Text>

          <Text theme='muted' align='center'>
            {group.locked ? (
              <FormattedMessage id='group.privacy.locked.info' defaultMessage='Discoverable. Users can join after their request is approved.' />
            ) : (
              <FormattedMessage id='group.privacy.public.info' defaultMessage='Discoverable. Anyone can join.' />
            )}
          </Text>
        </Stack>
      </Stack>
    }
  >
    <HStack space={1} alignItems='center' data-testid='group-privacy'>
      <Icon
        className='h-4 w-4'
        src={
          group.locked
            ? require('@tabler/icons/lock.svg')
            : require('@tabler/icons/world.svg')
        }
      />

      <Text theme='inherit' tag='span' size='sm' weight='medium'>
        {group.locked ? (
          <FormattedMessage id='group.privacy.locked' defaultMessage='Private' />
        ) : (
          <FormattedMessage id='group.privacy.public' defaultMessage='Public' />
        )}
      </Text>
    </HStack>
  </Popover>
);

export default GroupPrivacy;