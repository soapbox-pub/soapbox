import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { blockAccount } from 'soapbox/actions/accounts';
import { openModal } from 'soapbox/actions/modals';
import List, { ListItem } from 'soapbox/components/list';
import { Avatar, Divider, HStack, Icon, Stack, Text, Toggle } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch } from 'soapbox/hooks';
import { useChatActions, useChatSilence } from 'soapbox/queries/chats';

import ChatPaneHeader from './chat-pane-header';

const messages = defineMessages({
  blockMessage: { id: 'chat_settings.block.message', defaultMessage: 'Blocking will prevent this profile from direct messaging you and viewing your content. You can unblock later.' },
  blockHeading: { id: 'chat_settings.block.heading', defaultMessage: 'Block @{acct}' },
  blockConfirm: { id: 'chat_settings.block.confirm', defaultMessage: 'Block' },
  leaveMessage: { id: 'chat_settings.leave.message', defaultMessage: 'Are you sure you want to leave this chat? Messages will be deleted for you and this chat will be removed from your inbox.' },
  leaveHeading: { id: 'chat_settings.leave.heading', defaultMessage: 'Leave Chat' },
  leaveConfirm: { id: 'chat_settings.leave.confirm', defaultMessage: 'Leave Chat' },
  title: { id: 'chat_settings.title', defaultMessage: 'Chat Details' },
  blockUser: { id: 'chat_settings.options.block_user', defaultMessage: 'Block @{acct}' },
  leaveChat: { id: 'chat_settings.options.leave_chat', defaultMessage: 'Leave Chat' },
});

const ChatSettings = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { chat, setEditing, toggleChatPane } = useChatContext();
  const { isSilenced, handleSilence, fetchChatSilence } = useChatSilence(chat);

  const { deleteChat } = useChatActions(chat?.id as string);

  const closeSettings = () => setEditing(false);

  const minimizeChatPane = () => {
    closeSettings();
    toggleChatPane();
  };

  const handleBlockUser = () => {
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.blockHeading, { acct: chat?.account.acct }),
      message: intl.formatMessage(messages.blockMessage),
      confirm: intl.formatMessage(messages.blockConfirm),
      confirmationTheme: 'primary',
      onConfirm: () => dispatch(blockAccount(chat?.account.id as string)),
    }));
  };

  const handleLeaveChat = () => {
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.leaveHeading),
      message: intl.formatMessage(messages.leaveMessage),
      confirm: intl.formatMessage(messages.leaveConfirm),
      confirmationTheme: 'primary',
      onConfirm: () => deleteChat.mutate(),
    }));
  };

  useEffect(() => {
    if (chat?.id) {
      fetchChatSilence();
    }
  }, [chat?.id]);

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
              {intl.formatMessage(messages.title)}
            </Text>
          </HStack>
        }
      />

      <Stack space={4} className='w-5/6 mx-auto'>
        <HStack alignItems='center' space={3}>
          <Avatar src={chat.account.avatar_static} size={50} />
          <Stack>
            <Text weight='semibold'>{chat.account.display_name}</Text>
            <Text size='sm' theme='primary'>@{chat.account.acct}</Text>
          </Stack>
        </HStack>

        <Divider />

        <List>
          <ListItem label='Silence notifications'>
            <Toggle checked={isSilenced} onChange={handleSilence} />
          </ListItem>
        </List>

        <Divider />

        <Stack space={5}>
          <button onClick={handleBlockUser} className='w-full flex items-center space-x-2 font-bold text-sm text-primary-600 dark:text-accent-blue'>
            <Icon src={require('@tabler/icons/ban.svg')} className='w-5 h-5' />
            <span>{intl.formatMessage(messages.blockUser, { acct: chat.account.acct })}</span>
          </button>

          <button onClick={handleLeaveChat} className='w-full flex items-center space-x-2 font-bold text-sm text-danger-600'>
            <Icon src={require('@tabler/icons/logout.svg')} className='w-5 h-5' />
            <span>{intl.formatMessage(messages.leaveChat)}</span>
          </button>
        </Stack>
      </Stack>
    </>
  );
};

export default ChatSettings;
