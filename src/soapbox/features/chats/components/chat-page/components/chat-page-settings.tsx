import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { changeSetting } from 'soapbox/actions/settings';
import List, { ListItem } from 'soapbox/components/list';
import { Button, CardBody, CardTitle, Form, HStack, IconButton, Stack, Toggle } from 'soapbox/components/ui';
import SettingToggle from 'soapbox/features/notifications/components/setting-toggle';
import { useAppDispatch, useOwnAccount, useSettings } from 'soapbox/hooks';
import { useUpdateCredentials } from 'soapbox/queries/accounts';

type FormData = {
  accepts_chat_messages?: boolean
  chats_onboarded: boolean
}

const messages = defineMessages({
  title: { id: 'chat.page_settings.title', defaultMessage: 'Message Settings' },
  preferences: { id: 'chat.page_settings.preferences', defaultMessage: 'Preferences' },
  privacy: { id: 'chat.page_settings.privacy', defaultMessage: 'Privacy' },
  acceptingMessageLabel: { id: 'chat.page_settings.accepting_messages.label', defaultMessage: 'Allow users to start a new chat with you' },
  playSoundsLabel: { id: 'chat.page_settings.play_sounds.label', defaultMessage: 'Play a sound when you receive a message' },
  submit: { id: 'chat.page_settings.submit', defaultMessage: 'Save' },
});

const ChatPageSettings = () => {
  const { account } = useOwnAccount();
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const settings = useSettings();
  const updateCredentials = useUpdateCredentials();

  const [data, setData] = useState<FormData>({
    chats_onboarded: true,
    accepts_chat_messages: account?.pleroma?.accepts_chat_messages === true,
  });

  const onToggleChange = (key: string[], checked: boolean) => {
    dispatch(changeSetting(key, checked, { showAlert: true }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    updateCredentials.mutate(data);
  };

  return (
    <Stack className='h-full space-y-8 px-4 py-6 sm:p-6'>
      <HStack alignItems='center'>
        <IconButton
          src={require('@tabler/icons/arrow-left.svg')}
          className='mr-2 h-7 w-7 sm:mr-0 sm:hidden'
          onClick={() => history.push('/chats')}
        />

        <CardTitle title={intl.formatMessage(messages.title)} />
      </HStack>

      <Form onSubmit={handleSubmit}>
        <CardTitle title={intl.formatMessage(messages.preferences)} />

        <List>
          <ListItem
            label={intl.formatMessage(messages.playSoundsLabel)}
          >
            <SettingToggle settings={settings} settingPath={['chats', 'sound']} onChange={onToggleChange} />
          </ListItem>
        </List>

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