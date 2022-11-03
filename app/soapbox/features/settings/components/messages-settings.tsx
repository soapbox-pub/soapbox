import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list';
import { Toggle } from 'soapbox/components/ui';
import { useOwnAccount } from 'soapbox/hooks';
import { useUpdateCredentials } from 'soapbox/queries/accounts';

const messages = defineMessages({
  label: { id: 'settings.messages.label', defaultMessage: 'Allow others to message me' },
  hint: { id: 'settings.messages.hint', defaultMessage: 'Only people I follow can send me messages' },
});

const MessagesSettings = () => {
  const account = useOwnAccount();
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
        hint={intl.formatMessage(messages.hint)}
      >
        <Toggle
          checked={account.accepts_chat_messages}
          onChange={handleChange}
        />
      </ListItem>
    </List>
  );
};

export default MessagesSettings;