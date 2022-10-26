import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { blockAccount, unblockAccount } from 'soapbox/actions/accounts';
import { openModal } from 'soapbox/actions/modals';
import List, { ListItem } from 'soapbox/components/list';
import { Avatar, HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { MessageExpirationValues, useChatActions } from 'soapbox/queries/chats';

import ChatPaneHeader from './chat-pane-header';

const messages = defineMessages({
  blockMessage: { id: 'chat_settings.block.message', defaultMessage: 'Blocking will prevent this profile from direct messaging you and viewing your content. You can unblock later.' },
  blockHeading: { id: 'chat_settings.block.heading', defaultMessage: 'Block @{acct}' },
  blockConfirm: { id: 'chat_settings.block.confirm', defaultMessage: 'Block' },
  unblockMessage: { id: 'chat_settings.unblock.message', defaultMessage: 'Unblocking will allow you to resume messaging with the user.' },
  unblockHeading: { id: 'chat_settings.unblock.heading', defaultMessage: 'Unblock @{acct}' },
  unblockConfirm: { id: 'chat_settings.unblock.confirm', defaultMessage: 'Unblock' },
  leaveMessage: { id: 'chat_settings.leave.message', defaultMessage: 'Are you sure you want to leave this chat? Messages will be deleted for you and this chat will be removed from your inbox.' },
  leaveHeading: { id: 'chat_settings.leave.heading', defaultMessage: 'Leave Chat' },
  leaveConfirm: { id: 'chat_settings.leave.confirm', defaultMessage: 'Leave Chat' },
  title: { id: 'chat_settings.title', defaultMessage: 'Chat Details' },
  blockUser: { id: 'chat_settings.options.block_user', defaultMessage: 'Block @{acct}' },
  unblockUser: { id: 'chat_settings.options.unblock_user', defaultMessage: 'Unblock @{acct}' },
  leaveChat: { id: 'chat_settings.options.leave_chat', defaultMessage: 'Leave Chat' },
  autoDeleteLabel: { id: 'chat_settings.auto_delete.label', defaultMessage: 'Auto-delete messages' },
  autoDeleteHint: { id: 'chat_settings.auto_delete.hint', defaultMessage: 'Sent messages will auto-delete after the time period selected' },
  autoDelete7Days: { id: 'chat_settings.auto_delete.7days', defaultMessage: '7 days' },
  autoDelete14Days: { id: 'chat_settings.auto_delete.14days', defaultMessage: '14 days' },
  autoDelete30Days: { id: 'chat_settings.auto_delete.30days', defaultMessage: '30 days' },
  autoDelete90Days: { id: 'chat_settings.auto_delete.90days', defaultMessage: '90 days' },
});

const ChatSettings = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { chat, setEditing, toggleChatPane } = useChatContext();
  const { deleteChat, updateChat } = useChatActions(chat?.id as string);

  const handleUpdateChat = (value: MessageExpirationValues) => updateChat.mutate({ message_expiration: value });

  const isBlocking = useAppSelector((state) => state.getIn(['relationships', chat?.account?.id, 'blocking']));

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

  const handleUnblockUser = () => {
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.unblockHeading, { acct: chat?.account.acct }),
      message: intl.formatMessage(messages.unblockMessage),
      confirm: intl.formatMessage(messages.unblockConfirm),
      confirmationTheme: 'primary',
      onConfirm: () => dispatch(unblockAccount(chat?.account.id as string)),
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

        <List>
          <ListItem
            label={intl.formatMessage(messages.autoDeleteLabel)}
            hint={intl.formatMessage(messages.autoDeleteHint)}
          />
          <ListItem
            label={intl.formatMessage(messages.autoDelete7Days)}
            onSelect={() => handleUpdateChat(MessageExpirationValues.SEVEN)}
            isSelected={chat.message_expiration === MessageExpirationValues.SEVEN}
          />
          <ListItem
            label={intl.formatMessage(messages.autoDelete14Days)}
            onSelect={() => handleUpdateChat(MessageExpirationValues.FOURTEEN)}
            isSelected={chat.message_expiration === MessageExpirationValues.FOURTEEN}
          />
          <ListItem
            label={intl.formatMessage(messages.autoDelete30Days)}
            onSelect={() => handleUpdateChat(MessageExpirationValues.THIRTY)}
            isSelected={chat.message_expiration === MessageExpirationValues.THIRTY}
          />
          <ListItem
            label={intl.formatMessage(messages.autoDelete90Days)}
            onSelect={() => handleUpdateChat(MessageExpirationValues.NINETY)}
            isSelected={chat.message_expiration === MessageExpirationValues.NINETY}
          />
        </List>

        <Stack space={5}>
          <button onClick={isBlocking ? handleUnblockUser : handleBlockUser} className='w-full flex items-center space-x-2 font-bold text-sm text-primary-600 dark:text-accent-blue'>
            <Icon src={require('@tabler/icons/ban.svg')} className='w-5 h-5' />
            <span>{intl.formatMessage(isBlocking ? messages.unblockUser : messages.blockUser, { acct: chat.account.acct })}</span>
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
