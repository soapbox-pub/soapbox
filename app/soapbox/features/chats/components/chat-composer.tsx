import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { unblockAccount } from 'soapbox/actions/accounts';
import { openModal } from 'soapbox/actions/modals';
import { Button, HStack, IconButton, Stack, Text, Textarea } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

const messages = defineMessages({
  placeholder: { id: 'chat.input.placeholder', defaultMessage: 'Type a message' },
  send: { id: 'chat.actions.send', defaultMessage: 'Send' },
  retry: { id: 'chat.retry', defaultMessage: 'Retry?' },
  blocked: { id: 'chat_message_list.blocked', defaultMessage: 'You blocked this user' },
  unblock: { id: 'chat_composer.unblock', defaultMessage: 'Unblock' },
  unblockMessage: { id: 'chat_settings.unblock.message', defaultMessage: 'Unblocking will allow this profile to direct message you and view your content.' },
  unblockHeading: { id: 'chat_settings.unblock.heading', defaultMessage: 'Unblock @{acct}' },
  unblockConfirm: { id: 'chat_settings.unblock.confirm', defaultMessage: 'Unblock' },
});

interface IChatComposer extends Pick<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onKeyDown' | 'onChange' | 'disabled'> {
  value: string
  onSubmit: () => void
  errorMessage: string | undefined
}

/** Textarea input for chats. */
const ChatComposer = React.forwardRef<HTMLTextAreaElement | null, IChatComposer>(({
  onKeyDown,
  onChange,
  value,
  onSubmit,
  errorMessage = false,
  disabled = false,
}, ref) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { chat } = useChatContext();

  const isBlocked = useAppSelector((state) => state.getIn(['relationships', chat?.account?.id, 'blocked_by']));
  const isBlocking = useAppSelector((state) => state.getIn(['relationships', chat?.account?.id, 'blocking']));
  const maxCharacterCount = useAppSelector((state) => state.instance.getIn(['configuration', 'chats', 'max_characters']) as number);

  const isOverCharacterLimit = maxCharacterCount && value?.length > maxCharacterCount;
  const isSubmitDisabled = disabled || isOverCharacterLimit || value.length === 0;

  const overLimitText = maxCharacterCount ? maxCharacterCount - value?.length : '';

  const handleUnblockUser = () => {
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.unblockHeading, { acct: chat?.account.acct }),
      message: intl.formatMessage(messages.unblockMessage),
      confirm: intl.formatMessage(messages.unblockConfirm),
      confirmationTheme: 'primary',
      onConfirm: () => dispatch(unblockAccount(chat?.account.id as string)),
    }));
  };

  if (isBlocking) {
    return (
      <div className='mt-auto p-6 shadow-3xl dark:border-t-2 dark:border-solid dark:border-gray-800'>
        <Stack space={3} alignItems='center'>
          <Text align='center' theme='muted'>
            {intl.formatMessage(messages.blocked)}
          </Text>

          <Button theme='secondary' onClick={handleUnblockUser}>
            {intl.formatMessage(messages.unblock)}
          </Button>
        </Stack>
      </div>
    );
  }

  if (isBlocked) {
    return null;
  }

  return (
    <div className='mt-auto pt-4 px-4 shadow-3xl'>
      <HStack alignItems='stretch' justifyContent='between' space={4}>
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
            disabled={disabled}
          />
        </Stack>

        <Stack space={2} justifyContent='end' alignItems='center' className='w-10 mb-1.5'>
          {isOverCharacterLimit ? (
            <Text size='sm' theme='danger'>{overLimitText}</Text>
          ) : null}

          <IconButton
            src={require('assets/icons/airplane.svg')}
            iconClassName='w-5 h-5'
            className='text-primary-500'
            disabled={isSubmitDisabled}
            onClick={onSubmit}
          />
        </Stack>
      </HStack>

      <HStack alignItems='center' className='h-5' space={1}>
        {errorMessage && (
          <>
            <Text theme='danger' size='xs'>
              {errorMessage}
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