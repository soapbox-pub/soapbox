import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Stack, Text } from 'soapbox/components/ui';

const messages = defineMessages({
  title: { id: 'chat_search.blankslate.title', defaultMessage: 'Search followers' },
  body: { id: 'chat_search.blankslate.body', defaultMessage: 'You can start a chat with anyone that follows you.' },
});

const Blankslate = () => {
  const intl = useIntl();

  return (
    <Stack justifyContent='center' alignItems='center' space={2} className='h-full w-2/3 mx-auto'>
      <Text weight='bold' size='lg' align='center'>
        {intl.formatMessage(messages.title)}
      </Text>
      <Text theme='muted' align='center'>
        {intl.formatMessage(messages.body)}
      </Text>
    </Stack>
  );
};

export default Blankslate;