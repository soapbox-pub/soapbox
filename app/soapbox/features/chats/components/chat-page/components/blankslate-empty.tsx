import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Button, Stack, Text } from 'soapbox/components/ui';

interface IBlankslate {
}

/** To display on the chats main page when no message is selected. */
const BlankslateEmpty: React.FC<IBlankslate> = () => {
  const history = useHistory();

  const handleNewChat = () => {
    history.push('/chats/new');
  };

  return (
    <Stack space={6} alignItems='center' justifyContent='center' className='h-full p-6'>
      <Stack space={2} className='max-w-sm'>
        <Text size='2xl' weight='bold' tag='h2' align='center'>
          <FormattedMessage
            id='chats.main.blankslate.title'
            defaultMessage='No messages yet'
          />
        </Text>

        <Text size='sm' theme='muted' align='center'>
          <FormattedMessage
            id='chats.main.blankslate.subtitle'
            defaultMessage='Search for someone to chat with'
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

export default BlankslateEmpty;