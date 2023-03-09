import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { blockAccount, unblockAccount } from 'soapbox/actions/accounts';
import { openModal } from 'soapbox/actions/modals';
import List, { ListItem } from 'soapbox/components/list';
import { Avatar, HStack, Icon, Select, Stack, Text } from 'soapbox/components/ui';
import { ChatWidgetScreens, useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch, useAppSelector, useFeatures } from 'soapbox/hooks';
import { messageExpirationOptions, MessageExpirationValues, useChatActions } from 'soapbox/queries/chats';
import { secondsToDays } from 'soapbox/utils/numbers';

import ChatPaneHeader from './chat-pane-header';

const messages = defineMessages({
  blockMessage: { id: 'chat_settings.block.message', defaultMessage: 'Blocking will prevent this profile from direct messaging you and viewing your content. You can unblock later.' },
  blockHeading: { id: 'chat_settings.block.heading', defaultMessage: 'Block @{acct}' },
  blockConfirm: { id: 'chat_settings.block.confirm', defaultMessage: 'Block' },
  unblockMessage: { id: 'chat_settings.unblock.message', defaultMessage: 'Unblocking will allow this profile to direct message you and view your content.' },
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
  autoDeleteDays: { id: 'chat_settings.auto_delete.days', defaultMessage: '{day, plural, one {# day} other {# days}}' },
});

const ChatSettings = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();

  const { chat, changeScreen, toggleChatPane } = useChatContext();
  const { deleteChat, updateChat } = useChatActions(chat?.id as string);

  const handleUpdateChat = (value: MessageExpirationValues) => updateChat.mutate({ message_expiration: value });

  const isBlocking = useAppSelector((state) => state.getIn(['relationships', chat?.account?.id, 'blocking']));

  const closeSettings = () => {
    changeScreen(ChatWidgetScreens.CHAT, chat?.id);
  };

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

      <Stack space={4} className='mx-auto w-5/6'>
        <HStack alignItems='center' space={3}>
          <Avatar src={chat.account.avatar_static} size={50} />
          <Stack>
            <Text weight='semibold'>{chat.account.display_name}</Text>
            <Text size='sm' theme='primary'>@{chat.account.acct}</Text>
          </Stack>
        </HStack>

        {features.chatsExpiration && (
          <List>
            <ListItem label={intl.formatMessage(messages.autoDeleteLabel)}>
              <Select defaultValue={chat.message_expiration} onChange={(event) => handleUpdateChat(Number(event.target.value))}>
                {messageExpirationOptions.map((duration) => {
                  const inDays = secondsToDays(duration);

                  return (
                    <option key={duration} value={duration}>
                      {intl.formatMessage(messages.autoDeleteDays, { day: inDays })}
                    </option>
                  );
                })}
              </Select>
            </ListItem>
          </List>
        )}

        <Stack space={5}>
          <button onClick={isBlocking ? handleUnblockUser : handleBlockUser} className='flex w-full items-center space-x-2 text-sm font-bold text-primary-600 dark:text-accent-blue'>
            <Icon src={require('@tabler/icons/ban.svg')} className='h-5 w-5' />
            <span>{intl.formatMessage(isBlocking ? messages.unblockUser : messages.blockUser, { acct: chat.account.acct })}</span>
          </button>

          {features.chatsDelete && (
            <button onClick={handleLeaveChat} className='flex w-full items-center space-x-2 text-sm font-bold text-danger-600'>
              <Icon src={require('@tabler/icons/logout.svg')} className='h-5 w-5' />
              <span>{intl.formatMessage(messages.leaveChat)}</span>
            </button>
          )}
        </Stack>
      </Stack>
    </>
  );
};

export default ChatSettings;
