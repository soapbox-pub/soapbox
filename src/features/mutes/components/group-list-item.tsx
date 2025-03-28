import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { useUnmuteGroup } from 'soapbox/api/hooks/index.ts';
import GroupAvatar from 'soapbox/components/groups/group-avatar.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { type Group } from 'soapbox/schemas/index.ts';
import toast from 'soapbox/toast.tsx';

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