import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Button, Stack, Text } from 'soapbox/components/ui';

const messages = defineMessages({
  title: { id: 'chat_search.empty_results_blankslate.title', defaultMessage: 'No messages yet' },
  body: { id: 'chat_search.empty_results_blankslate.body', defaultMessage: 'Search for someone to chat with.' },
  action: { id: 'chat_search.empty_results_blankslate.action', defaultMessage: 'Message someone' },
});

interface IBlankslate {
  onSearch(): void
}

const Blankslate = ({ onSearch }: IBlankslate) => {
  const intl = useIntl();

  return (
    <Stack
      alignItems='center'
      justifyContent='center'
      className='h-full grow'
      data-testid='chat-pane-blankslate'
    >
      <Stack space={4}>
        <Stack space={1} className='mx-auto max-w-[80%]'>
          <Text size='lg' weight='bold' align='center'>
            {intl.formatMessage(messages.title)}
          </Text>

          <Text theme='muted' align='center'>
            {intl.formatMessage(messages.body)}
          </Text>
        </Stack>

        <div className='mx-auto'>
          <Button theme='primary' onClick={onSearch}>
            {intl.formatMessage(messages.action)}
          </Button>
        </div>
      </Stack>
    </Stack>
  );
};

export default Blankslate;
