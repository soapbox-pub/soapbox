import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { patchMe } from 'soapbox/actions/me';
import List, { ListItem } from 'soapbox/components/list';
import { Button, Column, HStack, Icon, Input } from 'soapbox/components/ui';
import { useAppDispatch, useInstance, useOwnAccount } from 'soapbox/hooks';
import toast from 'soapbox/toast';

interface IEditIdentity {
}

const messages = defineMessages({
  title: { id: 'settings.edit_identity', defaultMessage: 'Identity' },
  username: { id: 'edit_profile.fields.nip05_label', defaultMessage: 'Username' },
  success: { id: 'edit_profile.success', defaultMessage: 'Your profile has been successfully saved!' },
  error: { id: 'edit_profile.error', defaultMessage: 'Profile update failed' },
});

const identifiers = [
  'alex@alexgleason.me',
  'lunk@alexgleason.me',
  'yolo@alexgleason.me',
];

/** EditIdentity component. */
const EditIdentity: React.FC<IEditIdentity> = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { account } = useOwnAccount();

  if (!account) return null;

  const updateNip05 = async (nip05: string): Promise<void> => {
    try {
      await dispatch(patchMe({ nip05 }));
      toast.success(intl.formatMessage(messages.success));
    } catch (e) {
      toast.error(intl.formatMessage(messages.error));
    }
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <List>
        {identifiers.map((identifier) => (
          <ListItem
            key={identifier}
            label={identifier}
            isSelected={account.source?.nostr?.nip05 === identifier}
            onSelect={() => updateNip05(identifier)}
          />
        ))}
        <ListItem label={<UsernameInput />}>
          <Button theme='accent'>Add</Button>
        </ListItem>
      </List>
    </Column>
  );
};

const UsernameInput: React.FC<React.ComponentProps<typeof Input>> = (props) => {
  const intl = useIntl();
  const instance = useInstance();

  return (
    <Input
      placeholder={intl.formatMessage(messages.username)}
      append={(
        <HStack alignItems='center' space={1} className='rounded p-1 text-sm backdrop-blur'>
          <Icon className='h-4 w-4' src={require('@tabler/icons/at.svg')} />
          <span>{instance.domain}</span>
        </HStack>
      )}
      {...props}
    />
  );
};

export default EditIdentity;