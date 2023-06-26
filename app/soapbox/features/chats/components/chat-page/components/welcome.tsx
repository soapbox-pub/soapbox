import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list';
import { Button, CardBody, CardTitle, Form, Stack, Text, Toggle } from 'soapbox/components/ui';
import { useOwnAccount } from 'soapbox/hooks';
import { useUpdateCredentials } from 'soapbox/queries/accounts';

type FormData = {
  accepts_chat_messages?: boolean
  chats_onboarded: boolean
}

const messages = defineMessages({
  title: { id: 'chat.welcome.title', defaultMessage: 'Welcome to {br} Chats!' },
  subtitle: { id: 'chat.welcome.subtitle', defaultMessage: 'Exchange direct messages with other users.' },
  acceptingMessageLabel: { id: 'chat.welcome.accepting_messages.label', defaultMessage: 'Allow users to start a new chat with you' },
  notice: { id: 'chat.welcome.notice', defaultMessage: 'You can change these settings later.' },
  submit: { id: 'chat.welcome.submit', defaultMessage: 'Save & Continue' },
});

const Welcome = () => {
  const { account } = useOwnAccount();
  const intl = useIntl();
  const updateCredentials = useUpdateCredentials();

  const [data, setData] = useState<FormData>({
    chats_onboarded: true,
    accepts_chat_messages: account?.pleroma?.accepts_chat_messages === true,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    updateCredentials.mutate(data);
  };

  return (
    <Stack className='h-full overflow-y-auto px-4 py-20 sm:px-0' data-testid='chats-welcome'>
      <div className='mx-auto mb-2.5 w-full sm:w-3/5 xl:w-2/5'>
        <Text align='center' weight='bold' className='mb-6 text-2xl leading-8 md:text-3xl'>
          {intl.formatMessage(messages.title, { br: <br /> })}
        </Text>

        <Text align='center' theme='muted'>
          {intl.formatMessage(messages.subtitle)}
        </Text>
      </div>

      <Form onSubmit={handleSubmit} className='w-full space-y-8 sm:mx-auto sm:w-2/3 lg:w-3/5'>
        <Stack space={2}>
          <CardTitle title={<FormattedMessage id='chat.page_settings.privacy' defaultMessage='Privacy' />} />

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
        </Stack>

        <Text align='center' theme='muted'>
          {intl.formatMessage(messages.notice)}
        </Text>

        <Button type='submit' theme='primary' block size='lg' disabled={updateCredentials.isLoading}>
          {intl.formatMessage(messages.submit)}
        </Button>
      </Form>
    </Stack>
  );
};

export default Welcome;
