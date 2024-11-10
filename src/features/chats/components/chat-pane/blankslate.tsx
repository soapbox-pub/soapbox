import { defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';

const messages = defineMessages({
  title: { id: 'chat_pane.blankslate.title', defaultMessage: 'No messages yet' },
  body: { id: 'chat_pane.blankslate.body', defaultMessage: 'Search for someone to chat with.' },
  action: { id: 'chat_pane.blankslate.action', defaultMessage: 'Message someone' },
});

interface IBlankslate {
  onSearch(): void;
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
