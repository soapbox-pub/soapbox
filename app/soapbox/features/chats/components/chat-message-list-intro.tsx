import classNames from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import Link from 'soapbox/components/link';
import { Avatar, Button, HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch } from 'soapbox/hooks';
import { useChatActions } from 'soapbox/queries/chats';

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
  const { acceptChat, deleteChat } = useChatActions(chat?.id as string);

  const handleLeaveChat = () => {
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.leaveChatHeading),
      message: intl.formatMessage(messages.leaveChatMessage),
      confirm: intl.formatMessage(messages.leaveChatConfirm),
      confirmationTheme: 'primary',
      onConfirm: () => deleteChat.mutate(),
    }));
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
        <Link to={`@${chat.account.acct}`}>
          <Avatar src={chat.account.avatar_static} size={75} />
        </Link>

        <Text size='lg' align='center'>
          {needsAcceptance ? (
            <>
              <Text tag='span' weight='semibold'>@{chat.account.acct}</Text>
              {' '}
              <Text tag='span'>{intl.formatMessage(messages.intro)}</Text>
            </>
          ) : (
            <Link to={`@${chat.account.acct}`}>
              <Text tag='span' theme='inherit' weight='semibold'>@{chat.account.acct}</Text>
            </Link>
          )}
        </Text>
      </Stack>

      {needsAcceptance ? (
        <HStack alignItems='center' space={2} className='w-full'>
          <Button
            theme='primary'
            block
            onClick={() => acceptChat.mutate()}
            disabled={acceptChat.isLoading}
          >
            {intl.formatMessage(messages.accept)}
          </Button>

          <Button
            theme='danger'
            block
            onClick={handleLeaveChat}
          >
            {intl.formatMessage(messages.leaveChat)}
          </Button>
        </HStack>
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
