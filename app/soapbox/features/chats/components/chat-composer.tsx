import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { HStack, IconButton, Stack, Text, Textarea } from 'soapbox/components/ui';

const messages = defineMessages({
  placeholder: { id: 'chat.input.placeholder', defaultMessage: 'Type a message' },
  send: { id: 'chat.actions.send', defaultMessage: 'Send' },
  failedToSend: { id: 'chat.failed_to_send', defaultMessage: 'Message failed to send.' },
  retry: { id: 'chat.retry', defaultMessage: 'Retry?' },
});

interface IChatComposer extends Pick<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onKeyDown' | 'onChange'> {
  value: string,
  onSubmit: () => void,
  hasErrorSubmittingMessage?: boolean,
}

/** Textarea input for chats. */
const ChatComposer = React.forwardRef<HTMLTextAreaElement, IChatComposer>(({
  onKeyDown,
  onChange,
  value,
  onSubmit,
  hasErrorSubmittingMessage = false,
}, ref) => {
  const intl = useIntl();

  const isSubmitDisabled = value.length === 0;

  return (
    <div className='mt-auto pt-4 px-4 shadow-3xl'>
      <HStack alignItems='center' justifyContent='between' space={4}>
        <Stack grow>
          <Textarea
            autoFocus
            ref={ref}
            placeholder={intl.formatMessage(messages.placeholder)}
            onKeyDown={onKeyDown}
            value={value}
            onChange={onChange}
            isResizeable={false}
            autoGrow
            maxRows={5}
          />
        </Stack>

        <IconButton
          src={require('icons/airplane.svg')}
          iconClassName='w-5 h-5'
          className='text-primary-500'
          disabled={isSubmitDisabled}
          onClick={onSubmit}
        />
      </HStack>

      <HStack alignItems='center' className='h-5' space={1}>
        {hasErrorSubmittingMessage && (
          <>
            <Text theme='danger' size='xs'>
              {intl.formatMessage(messages.failedToSend)}
            </Text>

            <button onClick={onSubmit} className='flex hover:underline'>
              <Text theme='primary' size='xs' tag='span'>
                {intl.formatMessage(messages.retry)}
              </Text>
            </button>
          </>
        )}
      </HStack>
    </div>
  );
});

export default ChatComposer;