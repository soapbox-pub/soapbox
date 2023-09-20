import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Button, Stack, Text } from 'soapbox/components/ui';

/** To display on the chats main page when no message is selected, but chats are present. */
const BlankslateWithChats = () => {
  const history = useHistory();

  const handleNewChat = () => {
    history.push('/chats/new');
  };

  return (
    <Stack space={6} alignItems='center' justifyContent='center' className='h-full p-6'>
      <Stack space={2} className='max-w-sm'>
        <Text size='2xl' weight='bold' tag='h2' align='center'>
          <FormattedMessage
            id='chats.main.blankslate_with_chats.title'
            defaultMessage='Select a chat'
          />
        </Text>

        <Text size='sm' theme='muted' align='center'>
          <FormattedMessage
            id='chats.main.blankslate_with_chats.subtitle'
            defaultMessage='Select from one of your open chats or create a new message.'
          />
        </Text>
      </Stack>

      <Button theme='primary' onClick={handleNewChat}>
        <FormattedMessage
          id='chats.main.blankslate.new_chat'
          defaultMessage='Message someone'
        />
      </Button>
    </Stack>
  );
};

export default BlankslateWithChats;