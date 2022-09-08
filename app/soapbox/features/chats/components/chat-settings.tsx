import React from 'react';

import { blockAccount } from 'soapbox/actions/accounts';
import { openModal } from 'soapbox/actions/modals';
import { initReport } from 'soapbox/actions/reports';
import List, { ListItem } from 'soapbox/components/list';
import { Avatar, Divider, HStack, Icon, Stack, Text, Toggle } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch } from 'soapbox/hooks';
import { useChat, useChatSilences } from 'soapbox/queries/chats';

import ChatPaneHeader from './chat-pane-header';

const ChatSettings = () => {
  const dispatch = useAppDispatch();
  const { isSilenced, handleSilence } = useChatSilences();

  const { chat, setEditing, toggleChatPane } = useChatContext();
  const { deleteChat } = useChat(chat?.id as string);

  const closeSettings = () => setEditing(false);

  const minimizeChatPane = () => {
    closeSettings();
    toggleChatPane();
  };

  const handleBlockUser = () => {
    dispatch(openModal('CONFIRM', {
      heading: `Block @${chat?.account.acct}`,
      message: 'Blocking will prevent this profile from direct messaging you and viewing your content. You can unblock later.',
      confirm: 'Block',
      confirmationTheme: 'primary',
      onConfirm: () => dispatch(blockAccount(chat?.account.id as string)),
    }));
  };

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
    dispatch(initReport(chat?.account as any));
  };

  if (!chat) {
    return null;
  }

  return (
    <>
      <ChatPaneHeader
        isOpen
        isToggleable={false}
        onToggle={minimizeChatPane}
        title={
          <HStack alignItems='center' space={2}>
            <button onClick={closeSettings}>
              <Icon
                src={require('@tabler/icons/arrow-left.svg')}
                className='h-6 w-6 text-gray-600 dark:text-gray-400'
              />
            </button>

            <Text weight='semibold'>
              Chat Details
            </Text>
          </HStack>
        }
      />

      <Stack space={4} className='w-5/6 mx-auto'>
        <Stack alignItems='center' space={2}>
          <Avatar src={chat.account.avatar_static} size={75} />
          <Stack>
            <Text size='lg' weight='semibold' align='center'>{chat.account.display_name}</Text>
            <Text theme='primary' align='center'>@{chat.account.acct}</Text>
          </Stack>
        </Stack>

        <Divider />

        <List>
          <ListItem label='Silence notifications'>
            <Toggle checked={isSilenced} onChange={handleSilence} />
          </ListItem>
        </List>

        <Divider />

        <Stack space={5}>
          <button onClick={handleBlockUser} className='w-full flex items-center space-x-2 font-bold text-sm text-gray-700'>
            <Icon src={require('@tabler/icons/ban.svg')} className='w-5 h-5 text-gray-600' />
            <span>Block @{chat.account.acct}</span>
          </button>

          <button onClick={handleReportChat} className='w-full flex items-center space-x-2 font-bold text-sm text-gray-700'>
            <Icon src={require('@tabler/icons/flag.svg')} className='w-5 h-5 text-gray-600' />
            <span>Report @{chat.account.acct}</span>
          </button>

          <button onClick={handleLeaveChat} className='w-full flex items-center space-x-2 font-bold text-sm text-danger-600'>
            <Icon src={require('@tabler/icons/logout.svg')} className='w-5 h-5 text-danger-600' />
            <span>Leave chat</span>
          </button>
        </Stack>
      </Stack>
    </>
  );
};

export default ChatSettings;
