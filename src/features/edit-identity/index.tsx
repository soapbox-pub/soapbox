import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list';
import { Button, Column, HStack, Icon, Input } from 'soapbox/components/ui';
import { useInstance, useOwnAccount } from 'soapbox/hooks';

interface IEditIdentity {
}

const messages = defineMessages({
  title: { id: 'settings.edit_identity', defaultMessage: 'Identity' },
  username: { id: 'edit_profile.fields.nip05_label', defaultMessage: 'Username' },
});

const identifiers = [
  'alex@alexgleason.me',
  'lunk@alexgleason.me',
  'yolo@alexgleason.me',
];

/** EditIdentity component. */
const EditIdentity: React.FC<IEditIdentity> = () => {
  const intl = useIntl();
  const { account } = useOwnAccount();

  if (!account) return null;

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <List>
        {identifiers.map((identifier) => (
          <ListItem
            key={identifier}
            label={identifier}
            isSelected={account.acct === identifier}
            onSelect={() => { /* TODO */ }}
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