import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import List, { ListItem } from 'soapbox/components/list';
import { Button, CardBody, CardTitle, Form, HStack, IconButton, Stack, Toggle } from 'soapbox/components/ui';
import { useOwnAccount } from 'soapbox/hooks';
import { useUpdateCredentials } from 'soapbox/queries/accounts';

type FormData = {
  accepts_chat_messages?: boolean
  chats_onboarded: boolean
}

const messages = defineMessages({
  title: { id: 'chat.page_settings.title', defaultMessage: 'Message Settings' },
  privacy: { id: 'chat.page_settings.privacy', defaultMessage: 'Privacy' },
  acceptingMessageLabel: { id: 'chat.page_settings.accepting_messages.label', defaultMessage: 'Allow your followers to start a new chat with you' },
  submit: { id: 'chat.page_settings.submit', defaultMessage: 'Save' },
});

const ChatPageSettings = () => {
  const account = useOwnAccount();
  const intl = useIntl();
  const history = useHistory();
  const updateCredentials = useUpdateCredentials();

  const [data, setData] = useState<FormData>({
    chats_onboarded: true,
    accepts_chat_messages: account?.accepts_chat_messages,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    updateCredentials.mutate(data);
  };

  return (
    <Stack className='h-full py-6 px-4 sm:p-6 space-y-8'>
      <HStack alignItems='center'>
        <IconButton
          src={require('@tabler/icons/arrow-left.svg')}
          className='sm:hidden h-7 w-7 mr-2 sm:mr-0'
          onClick={() => history.push('/chats')}
        />

        <CardTitle title={intl.formatMessage(messages.title)} />
      </HStack>

      <Form onSubmit={handleSubmit}>
        <CardTitle title={intl.formatMessage(messages.privacy)} />

        <CardBody>
          <List>
            <ListItem
              label={intl.formatMessage(messages.acceptingMessageLabel)}
            >
              <Toggle
                checked={data.accepts_chat_messages}
                onChange={(event) => setData((prevData) => ({ ...prevData, accepts_chat_messages: event.target.checked }))}
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