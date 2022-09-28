import classNames from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import { initReport } from 'soapbox/actions/reports';
import { Avatar, Button, HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch } from 'soapbox/hooks';
import { useChat } from 'soapbox/queries/chats';

const messages = defineMessages({
  leaveChatHeading: { id: 'chat_message_list_intro.leave_chat.heading', defaultMessage: 'Leave Chat' },
  leaveChatMessage: { id: 'chat_message_list_intro.leave_chat.message', defaultMessage: 'Are you sure you want to leave this chat? Messages will be deleted for you and this chat will be removed from your inbox.' },
  leaveChatConfirm: { id: 'chat_message_list_intro.leave_chat.confirm', defaultMessage: 'Leave Chat' },
  intro: { id: 'chat_message_list_intro.intro', defaultMessage: 'wants to start a chat with you' },
  accept: { id: 'chat_message_list_intro.actions.accept', defaultMessage: 'Accept' },
  leaveChat: { id: 'chat_message_list_intro.actions.leave_chat', defaultMessage: 'Leave chat' },
  report: { id: 'chat_message_list_intro.actions.report', defaultMessage: 'Report' },
  messageLifespan: { id: 'chat_message_list_intro.actions.message_lifespan', defaultMessage: 'Messages older than 15 days are deleted.' },
});

const ChatMessageListIntro = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { chat, needsAcceptance } = useChatContext();
  const { acceptChat, deleteChat } = useChat(chat?.id as string);

  const handleLeaveChat = () => {
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.leaveChatHeading),
      message: intl.formatMessage(messages.leaveChatMessage),
      confirm: intl.formatMessage(messages.leaveChatConfirm),
      confirmationTheme: 'primary',
      onConfirm: () => deleteChat.mutate(),
    }));
  };

  const handleReportChat = () => {
    dispatch(initReport(chat?.account as any));
    acceptChat.mutate();
  };

  if (!chat) {
    return null;
  }

  return (
    <Stack
      data-testid='chat-message-list-intro'
      justifyContent='center'
      alignItems='center'
      space={4}
      className={
        classNames({
          'w-3/4 mx-auto': needsAcceptance,
          'mt-6': true,
        })
      }
    >
      <Stack alignItems='center' space={2}>
        <Avatar src={chat.account.avatar_static} size={75} />
        <Text size='lg' align='center'>
          {needsAcceptance ? (
            <>
              <Text tag='span' weight='semibold'>@{chat.account.acct}</Text>
              {' '}
              <Text tag='span'>{intl.formatMessage(messages.intro)}</Text>
            </>
          ) : (
            <Text tag='span' weight='semibold'>@{chat.account.acct}</Text>
          )}
        </Text>
      </Stack>

      {needsAcceptance ? (
        <Stack space={2} className='w-full'>
          <Button
            theme='primary'
            block
            onClick={() => acceptChat.mutate()}
            disabled={acceptChat.isLoading}
          >
            {intl.formatMessage(messages.accept)}
          </Button>

          <HStack alignItems='center' space={2} className='w-full'>
            <Button
              theme='secondary'
              block
              onClick={handleReportChat}
            >
              {intl.formatMessage(messages.report)}
            </Button>

            <Button
              theme='danger'
              block
              onClick={handleLeaveChat}
            >
              {intl.formatMessage(messages.leaveChat)}
            </Button>
          </HStack>
        </Stack>
      ) : (
        <HStack justifyContent='center' alignItems='center' space={1} className='flex-shrink-0'>
          <Icon src={require('@tabler/icons/clock.svg')} className='text-gray-600 w-4 h-4' />
          <Text size='sm' theme='muted'>
            {intl.formatMessage(messages.messageLifespan)}
          </Text>
        </HStack>
      )}
    </Stack>
  );
};

export default ChatMessageListIntro;
