import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { Avatar, HStack, Icon, Stack, Text } from './ui';

import type { Group as GroupEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  groupHeader: { id: 'group.header.alt', defaultMessage: 'Group header' },
});

interface IGroupCard {
  group: GroupEntity
}

const GroupCard: React.FC<IGroupCard> = ({ group }) => {
  const intl = useIntl();

  return (
    <Stack className='relative h-[240px] rounded-lg border border-solid border-gray-300 bg-white dark:border-primary-800 dark:bg-primary-900'>
      {/* Group Cover Image */}
      <Stack grow className='relative basis-1/2 rounded-t-lg bg-primary-100 dark:bg-gray-800'>
        {group.header && (
          <img
            className='absolute inset-0 h-full w-full rounded-t-lg object-cover'
            src={group.header} alt={intl.formatMessage(messages.groupHeader)}
          />
        )}
      </Stack>

      {/* Group Avatar */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <Avatar className='ring-2 ring-white dark:ring-primary-900' src={group.avatar} size={64} />
      </div>

      {/* Group Info */}
      <Stack alignItems='center' justifyContent='end' grow className='basis-1/2 py-4' space={0.5}>
        <Text size='lg' weight='bold' dangerouslySetInnerHTML={{ __html: group.display_name_html }} />

        <HStack className='text-gray-700 dark:text-gray-600' space={3} wrap>
          {group.relationship?.role === 'admin' ? (
            <HStack space={1} alignItems='center'>
              <Icon className='h-4 w-4' src={require('@tabler/icons/users.svg')} />
              <Text theme='inherit'><FormattedMessage id='group.role.admin' defaultMessage='Admin' /></Text>
            </HStack>
          ) : group.relationship?.role === 'moderator' && (
            <HStack space={1} alignItems='center'>
              <Icon className='h-4 w-4' src={require('@tabler/icons/gavel.svg')} />
              <Text theme='inherit'><FormattedMessage id='group.role.moderator' defaultMessage='Moderator' /></Text>
            </HStack>
          )}

          {group.locked ? (
            <HStack space={1} alignItems='center'>
              <Icon className='h-4 w-4' src={require('@tabler/icons/lock.svg')} />
              <Text theme='inherit'><FormattedMessage id='group.privacy.locked' defaultMessage='Private' /></Text>
            </HStack>
          ) : (
            <HStack space={1} alignItems='center'>
              <Icon className='h-4 w-4' src={require('@tabler/icons/world.svg')} />
              <Text theme='inherit'><FormattedMessage id='group.privacy.public' defaultMessage='Public' /></Text>
            </HStack>
          )}
        </HStack>
      </Stack>
    </Stack>
  );
};

export default GroupCard;
