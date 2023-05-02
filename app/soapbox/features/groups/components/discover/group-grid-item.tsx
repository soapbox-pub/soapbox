import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';

import GroupAvatar from 'soapbox/components/groups/group-avatar';
import { HStack, Stack, Text } from 'soapbox/components/ui';
import GroupActionButton from 'soapbox/features/group/components/group-action-button';
import GroupHeaderImage from 'soapbox/features/group/components/group-header-image';
import GroupMemberCount from 'soapbox/features/group/components/group-member-count';
import GroupPrivacy from 'soapbox/features/group/components/group-privacy';

import type { Group } from 'soapbox/schemas';

interface IGroup {
  group: Group
  width?: number
}

const GroupGridItem = forwardRef((props: IGroup, ref: React.ForwardedRef<HTMLDivElement>) => {
  const { group, width = 'auto' } = props;

  return (
    <div
      key={group.id}
      className='relative flex shrink-0 flex-col space-y-2 px-1'
      style={{
        width,
      }}
      data-testid='group-grid-item'
    >
      <Link to={`/group/${group.slug}`}>
        <Stack
          className='aspect-h-7 aspect-w-10 h-full w-full overflow-hidden rounded-lg'
          ref={ref}
          style={{ minHeight: 180 }}
        >
          <GroupHeaderImage
            group={group}
            className='absolute inset-0 object-cover'
          />

          <div
            className='absolute inset-x-0 bottom-0 flex justify-center rounded-b-lg bg-gradient-to-t from-gray-900 to-transparent pb-8 pt-12 transition-opacity duration-500'
          />

          <Stack justifyContent='end' className='p-4 text-white' space={3}>
            <GroupAvatar
              group={group}
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
        </Stack>
      </Link>

      <GroupActionButton group={group} />
    </div>
  );
});

export default GroupGridItem;