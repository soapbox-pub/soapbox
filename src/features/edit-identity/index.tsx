import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { patchMe } from 'soapbox/actions/me';
import List, { ListItem } from 'soapbox/components/list';
import { Button, Column, Emoji, HStack, Icon, Input, Tooltip } from 'soapbox/components/ui';
import { useAppDispatch, useInstance, useOwnAccount } from 'soapbox/hooks';
import toast from 'soapbox/toast';

interface IEditIdentity {
}

const messages = defineMessages({
  title: { id: 'settings.edit_identity', defaultMessage: 'Identity' },
  username: { id: 'edit_profile.fields.nip05_label', defaultMessage: 'Username' },
  unverified: { id: 'edit_profile.fields.nip05_unverified', defaultMessage: 'Name could not be verified and won\'t be used.' },
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
    if (account.source?.nostr?.nip05 === nip05) return;
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
            label={
              <HStack alignItems='center' space={2}>
                <span>{identifier}</span>
                {(account.source?.nostr?.nip05 === identifier && account.acct !== identifier) && (
                  <Tooltip text={intl.formatMessage(messages.unverified)}>
                    <div>
                      <Emoji className='h-4 w-4' emoji='⚠️' />
                    </div>
                  </Tooltip>
                )}
              </HStack>
            }
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