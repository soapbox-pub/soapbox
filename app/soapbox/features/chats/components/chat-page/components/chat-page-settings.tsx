import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list';
import { Button, CardBody, CardTitle, Form, Stack, Toggle } from 'soapbox/components/ui';
import { useOwnAccount } from 'soapbox/hooks';
import { useUpdateCredentials } from 'soapbox/queries/accounts';

type FormData = {
  accepting_messages?: boolean
  chats_onboarded: boolean
}

const messages = defineMessages({
  title: { id: 'chat.page_settings.title', defaultMessage: 'Message Settings' },
  privacy: { id: 'chat.page_settings.privacy', defaultMessage: 'Privacy' },
  acceptingMessageLabel: { id: 'chat.page_settings.accepting_messages.label', defaultMessage: 'Allow others to message me' },
  acceptingMessageHint: { id: 'chat.page_settings.accepting_messages.hint', defaultMessage: 'Only people I follow can send me messages' },
  submit: { id: 'chat.page_settings.submit', defaultMessage: 'Save' },
});

const ChatPageSettings = () => {
  const account = useOwnAccount();
  const intl = useIntl();
  const updateCredentials = useUpdateCredentials();

  const [data, setData] = useState<FormData>({
    chats_onboarded: true,
    accepting_messages: account?.accepting_messages,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    updateCredentials.mutate(data);
  };

  return (
    <Stack className='h-full p-6 space-y-8'>
      <CardTitle title={intl.formatMessage(messages.title)} />

      <Form onSubmit={handleSubmit}>
        <CardTitle title={intl.formatMessage(messages.privacy)} />

        <CardBody>
          <List>
            <ListItem
              label={intl.formatMessage(messages.acceptingMessageLabel)}
              hint={intl.formatMessage(messages.acceptingMessageHint)}
            >
              <Toggle
                checked={data.accepting_messages}
                onChange={(event) => setData((prevData) => ({ ...prevData, accepting_messages: event.target.checked }))}
              />
            </ListItem>
          </List>
        </CardBody>

        <Button type='submit' theme='primary' disabled={updateCredentials.isLoading}>
          {intl.formatMessage(messages.submit)}
        </Button>
      </Form>
    </Stack>
  );
};

export default ChatPageSettings;