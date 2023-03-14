import React, { forwardRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { Avatar, Button, HStack, Stack, Text } from 'soapbox/components/ui';
import GroupMemberCount from 'soapbox/features/group/components/group-member-count';
import GroupPrivacy from 'soapbox/features/group/components/group-privacy';
import { useJoinGroup } from 'soapbox/queries/groups';
import { Group as GroupEntity } from 'soapbox/types/entities';

interface IGroup {
  group: GroupEntity
  width?: number
}

const GroupGridItem = forwardRef((props: IGroup, ref: React.ForwardedRef<HTMLDivElement>) => {
  const { group, width = 'auto' } = props;

  const joinGroup = useJoinGroup();

  const onJoinGroup = () => joinGroup.mutate(group);

  return (
    <div
      key={group.id}
      className='relative flex shrink-0 flex-col space-y-2 px-0.5'
      style={{
        width,
      }}
    >
      <Link to={`/groups/${group.id}`}>
        <Stack
          className='aspect-w-10 aspect-h-7 h-full w-full overflow-hidden rounded-lg'
          ref={ref}
          style={{ minHeight: 180 }}
        >
          {group.header && (
            <img
              src={group.header}
              alt='Group cover'
              className='absolute inset-0 object-cover'
            />
          )}

          <Stack justifyContent='end' className='z-10 p-4 text-white' space={3}>
            <Avatar
              className='ring-2 ring-white'
              src={group.avatar}
              size={44}
            />

            <Stack space={1}>
              <Text
                weight='bold'
                dangerouslySetInnerHTML={{ __html: group.display_name_html }}
                theme='inherit'
                truncate
              />

              <HStack alignItems='center' space={1}>
                <GroupPrivacy group={group} />
                <span>&bull;</span>
                <GroupMemberCount group={group} />
              </HStack>
            </Stack>
          </Stack>

          <div
            className='absolute inset-x-0 bottom-0 z-0 flex justify-center rounded-b-lg bg-gradient-to-t from-gray-900 to-transparent pt-12 pb-8 transition-opacity duration-500'
          />
        </Stack>
      </Link>

      <Button
        theme='primary'
        block
        onClick={onJoinGroup}
        disabled={joinGroup.isLoading}
      >
        {group.locked
          ? <FormattedMessage id='group.join.private' defaultMessage='Request Access' />
          : <FormattedMessage id='group.join.public' defaultMessage='Join Group' />}
      </Button>
    </div>
  );
});

export default GroupGridItem;