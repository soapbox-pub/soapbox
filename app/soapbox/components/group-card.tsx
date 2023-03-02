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
    <div className='overflow-hidden'>
      <Stack className='rounded-lg border border-solid border-gray-300 bg-white dark:border-primary-800 dark:bg-primary-900 sm:rounded-xl'>
        <div className='relative -m-[1px] mb-0 h-[120px] rounded-t-lg bg-primary-100 dark:bg-gray-800 sm:rounded-t-xl'>
          {group.header && <img className='h-full w-full rounded-t-lg object-cover sm:rounded-t-xl' src={group.header} alt={intl.formatMessage(messages.groupHeader)} />}
          <div className='absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2'>
            <Avatar className='ring-2 ring-white dark:ring-primary-900' src={group.avatar} size={64} />
          </div>
        </div>
        <Stack className='p-3 pt-9' alignItems='center' space={3}>
          <Text size='lg' weight='bold' dangerouslySetInnerHTML={{ __html: group.display_name_html }} />
          <HStack className='text-gray-700 dark:text-gray-600' space={3} wrap>
            {group.relationship?.role === 'admin' ? (
              <HStack space={1} alignItems='center'>
                <Icon className='h-4 w-4' src={require('@tabler/icons/users.svg')} />
                <span><FormattedMessage id='group.role.admin' defaultMessage='Admin' /></span>
              </HStack>
            ) : group.relationship?.role === 'moderator' && (
              <HStack space={1} alignItems='center'>
                <Icon className='h-4 w-4' src={require('@tabler/icons/gavel.svg')} />
                <span><FormattedMessage id='group.role.moderator' defaultMessage='Moderator' /></span>
              </HStack>
            )}
            {group.locked ? (
              <HStack space={1} alignItems='center'>
                <Icon className='h-4 w-4' src={require('@tabler/icons/lock.svg')} />
                <span><FormattedMessage id='group.privacy.locked' defaultMessage='Private' /></span>
              </HStack>
            ) : (
              <HStack space={1} alignItems='center'>
                <Icon className='h-4 w-4' src={require('@tabler/icons/world.svg')} />
                <span><FormattedMessage id='group.privacy.public' defaultMessage='Public' /></span>
              </HStack>
            )}
          </HStack>
        </Stack>
      </Stack>
    </div>
  );
};

export default GroupCard;
