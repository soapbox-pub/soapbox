import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list';
import { Toggle } from 'soapbox/components/ui';
import { useOwnAccount } from 'soapbox/hooks';
import { useUpdateCredentials } from 'soapbox/queries/accounts';

const messages = defineMessages({
  label: { id: 'settings.messages.label', defaultMessage: 'Allow users to start a new chat with you' },
});

const MessagesSettings = () => {
  const { account } = useOwnAccount();
  const intl = useIntl();
  const updateCredentials = useUpdateCredentials();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateCredentials.mutate({ accepts_chat_messages: event.target.checked });
  };

  if (!account) {
    return null;
  }

  return (
    <List>
      <ListItem
        label={intl.formatMessage(messages.label)}
      >
        <Toggle
          checked={account.pleroma?.accepts_chat_messages}
          onChange={handleChange}
        />
      </ListItem>
    </List>
  );
};

export default MessagesSettings;