import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import GroupHeaderImage from 'soapbox/features/group/components/group-header-image.tsx';
import GroupMemberCount from 'soapbox/features/group/components/group-member-count.tsx';
import GroupPrivacy from 'soapbox/features/group/components/group-privacy.tsx';
import GroupRelationship from 'soapbox/features/group/components/group-relationship.tsx';

import GroupAvatar from './groups/group-avatar.tsx';

import type { Group as GroupEntity } from 'soapbox/types/entities.ts';

interface IGroupCard {
  group: GroupEntity;
}

const GroupCard: React.FC<IGroupCard> = ({ group }) => {
  return (
    <Stack
      className='relative h-[240px] rounded-lg border border-solid border-gray-300 bg-white black:bg-white dark:border-primary-800 dark:bg-primary-900'
      data-testid='group-card'
    >
      {/* Group Cover Image */}
      <Stack grow className='relative basis-1/2 rounded-t-lg bg-primary-100 dark:bg-gray-800'>
        <GroupHeaderImage
          group={group}
          className='absolute inset-0 size-full rounded-t-lg object-cover'
        />
      </Stack>

      {/* Group Avatar */}
      <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
        <GroupAvatar group={group} size={64} withRing />
      </div>

      {/* Group Info */}
      <Stack alignItems='center' justifyContent='end' grow className='basis-1/2 py-4' space={0.5}>
        <HStack alignItems='center' space={1.5}>
          <Text size='lg' weight='bold'>
            {group.display_name}
          </Text>

          {group.relationship?.pending_requests && (
            <div className='size-2 rounded-full bg-secondary-500' />
          )}
        </HStack>

        <HStack className='text-gray-700 dark:text-gray-600' space={2} wrap>
          <GroupRelationship group={group} />
          <GroupPrivacy group={group} />
          <GroupMemberCount group={group} />
        </HStack>
      </Stack>
    </Stack>
  );
};

export default GroupCard;
