import React from 'react';
import { FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import { Button, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useOwnAccount } from 'soapbox/hooks';
import { PERMISSION_CREATE_GROUPS, hasPermission } from 'soapbox/utils/permissions';

const NewGroupPanel = () => {
  const dispatch = useAppDispatch();
  const account = useOwnAccount();

  const createGroup = () => {
    dispatch(openModal('MANAGE_GROUP'));
  };

  if (!hasPermission(account, PERMISSION_CREATE_GROUPS)) return null;

  return (
    <Stack space={2}>
      <Stack>
        <Text size='lg' weight='bold'>
          <FormattedMessage id='new_group_panel.title' defaultMessage='Create New Group' />
        </Text>

        <Text theme='muted' size='sm'>
          <FormattedMessage id='new_group_panel.subtitle' defaultMessage="Can't find what you're looking for? Start your own private or public group." />
        </Text>
      </Stack>

      <Button
        icon={require('@tabler/icons/circles.svg')}
        onClick={createGroup}
        theme='secondary'
        block
      >
        <FormattedMessage id='new_group_panel.action' defaultMessage='Create group' />
      </Button>
    </Stack>
  );
};

export default NewGroupPanel;
