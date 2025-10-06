import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { useUnmuteGroup } from '@/api/hooks/index.ts';
import GroupAvatar from '@/components/groups/group-avatar.tsx';
import Button from '@/components/ui/button.tsx';
import HStack from '@/components/ui/hstack.tsx';
import Text from '@/components/ui/text.tsx';
import { type Group } from '@/schemas/index.ts';
import toast from '@/toast.tsx';

interface IGroupListItem {
  group: Group;
  onUnmute(): void;
}

const messages = defineMessages({
  unmuteSuccess: { id: 'group.unmute.success', defaultMessage: 'Unmuted the group' },
});

const GroupListItem = ({ group, onUnmute }: IGroupListItem) => {
  const intl = useIntl();

  const unmuteGroup = useUnmuteGroup(group);

  const handleUnmute = () => {
    unmuteGroup.mutate(undefined, {
      onSuccess() {
        onUnmute();
        toast.success(intl.formatMessage(messages.unmuteSuccess));
      },
    });
  };

  return (
    <HStack alignItems='center' justifyContent='between'>
      <HStack alignItems='center' space={3}>
        <GroupAvatar
          group={group}
          size={42}
        />

        <Text weight='semibold' size='sm' truncate>
          {group.display_name}
        </Text>
      </HStack>

      <Button theme='primary' type='button' onClick={handleUnmute} size='sm'>
        <FormattedMessage id='group.unmute.label' defaultMessage='Unmute' />
      </Button>
    </HStack>
  );
};

export default GroupListItem;