import classNames from 'clsx';
import React from 'react';

import { openModal } from 'soapbox/actions/modals';
import { initReport } from 'soapbox/actions/reports';
import { Avatar, Button, HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch } from 'soapbox/hooks';
import { useChat } from 'soapbox/queries/chats';

const ChatMessageListIntro = () => {
  const dispatch = useAppDispatch();

  const { chat, needsAcceptance } = useChatContext();
  const { acceptChat, deleteChat } = useChat(chat?.id as string);

  const handleLeaveChat = () => {
    dispatch(openModal('CONFIRM', {
      heading: 'Leave Chat',
      message: 'Are you sure you want to leave this chat? This conversation will be removed from your inbox.',
      confirm: 'Leave Chat',
      confirmationTheme: 'primary',
      onConfirm: () => {
        deleteChat.mutate();
      },
    }));
  };

  const handleReportChat = () => {
    dispatch(initReport(chat?.account));
    acceptChat.mutate();
  };

  if (!chat) {
    return null;
  }

  return (
    <Stack
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
              <Text tag='span'>wants to start a chat with you</Text>
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
            onClick={() => {
              acceptChat.mutate();
              // inputRef?.current?.focus();
            }}
            disabled={acceptChat.isLoading}
          >
            Accept
          </Button>

          <HStack alignItems='center' space={2} className='w-full'>
            <Button
              theme='danger'
              block
              onClick={handleLeaveChat}
            >
              Leave chat
            </Button>

            <Button
              theme='secondary'
              block
              onClick={handleReportChat}
            >
              Report
            </Button>
          </HStack>
        </Stack>
      ) : (
        <HStack justifyContent='center' alignItems='center' space={1} className='flex-shrink-0'>
          <Icon src={require('@tabler/icons/clock.svg')} className='text-gray-600 w-4 h-4' />
          <Text size='sm' theme='muted'>
            Messages older than 15 days are deleted.
          </Text>
        </HStack>
      )}
    </Stack>
  );
};

export default ChatMessageListIntro;
