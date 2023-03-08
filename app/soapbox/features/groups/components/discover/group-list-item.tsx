import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Avatar, Button, HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import { Group as GroupEntity } from 'soapbox/types/entities';
import { shortNumberFormat } from 'soapbox/utils/numbers';

interface IGroup {
  group: GroupEntity
  withJoinAction?: boolean
}

const GroupListItem = (props: IGroup) => {
  const { group, withJoinAction = true } = props;

  return (
    <HStack
      key={group.id}
      alignItems='center'
      justifyContent='between'
    >
      <HStack alignItems='center' space={2}>
        <Avatar
          className='ring-2 ring-white dark:ring-primary-900'
          src={group.avatar}
          size={44}
        />

        <Stack>
          <Text
            weight='bold'
            dangerouslySetInnerHTML={{ __html: group.display_name_html }}
          />

          <HStack className='text-gray-700 dark:text-gray-600' space={1} alignItems='center'>
            <Icon
              className='h-4.5 w-4.5'
              src={group.locked ? require('@tabler/icons/lock.svg') : require('@tabler/icons/world.svg')}
            />

            <Text theme='inherit' tag='span' size='sm' weight='medium'>
              {group.locked ? (
                <FormattedMessage id='group.privacy.locked' defaultMessage='Private' />
              ) : (
                <FormattedMessage id='group.privacy.public' defaultMessage='Public' />
              )}
            </Text>

            {typeof group.members_count !== 'undefined' && (
              <>
                <span>&bull;</span>
                <Text theme='inherit' tag='span' size='sm' weight='medium'>
                  {shortNumberFormat(group.members_count)}
                  {' '}
                  <FormattedMessage
                    id='groups.discover.search.results.member_count'
                    defaultMessage='{members, plural, one {member} other {members}}'
                    values={{
                      members: group.members_count,
                    }}
                  />
                </Text>
              </>
            )}
          </HStack>
        </Stack>
      </HStack>

      {withJoinAction && (
        <Button theme='primary'>
          {group.locked
            ? <FormattedMessage id='group.join.private' defaultMessage='Request Access' />
            : <FormattedMessage id='group.join.public' defaultMessage='Join Group' />}
        </Button>
      )}
    </HStack>
  );
};

export default GroupListItem;
