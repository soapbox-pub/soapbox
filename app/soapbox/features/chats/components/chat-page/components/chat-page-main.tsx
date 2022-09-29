import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { blockAccount } from 'soapbox/actions/accounts';
import { openModal } from 'soapbox/actions/modals';
import { initReport } from 'soapbox/actions/reports';
import List, { ListItem } from 'soapbox/components/list';
import { Avatar, Divider, HStack, Icon, IconButton, Menu, MenuButton, MenuItem, MenuList, Stack, Text, Toggle } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification_badge';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch, useOwnAccount } from 'soapbox/hooks';
import { useChatActions, useChatSilence } from 'soapbox/queries/chats';

import Chat from '../../chat';

import Welcome from './welcome';

const messages = defineMessages({
  blockMessage: { id: 'chat_settings.block.message', defaultMessage: 'Blocking will prevent this profile from direct messaging you and viewing your content. You can unblock later.' },
  blockHeading: { id: 'chat_settings.block.heading', defaultMessage: 'Block @{acct}' },
  blockConfirm: { id: 'chat_settings.block.confirm', defaultMessage: 'Block' },
  leaveMessage: { id: 'chat_settings.leave.message', defaultMessage: 'Are you sure you want to leave this chat? Messages will be deleted for you and this chat will be removed from your inbox.' },
  leaveHeading: { id: 'chat_settings.leave.heading', defaultMessage: 'Leave Chat' },
  leaveConfirm: { id: 'chat_settings.leave.confirm', defaultMessage: 'Leave Chat' },
  blockUser: { id: 'chat_settings.options.block_user', defaultMessage: 'Block @{acct}' },
  reportUser: { id: 'chat_settings.options.report_user', defaultMessage: 'Report @{acct}' },
  leaveChat: { id: 'chat_settings.options.leave_chat', defaultMessage: 'Leave Chat' },
});

const ChatPageMain = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const account = useOwnAccount();

  const { chat, setChat } = useChatContext();
  const { isSilenced, handleSilence, fetchChatSilence } = useChatSilence(chat);
  const { deleteChat } = useChatActions(chat?.id as string);

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

  const handleReportChat = () => dispatch(initReport(chat?.account as any));

  useEffect(() => {
    if (chat?.id) {
      fetchChatSilence();
    }
  }, [chat?.id]);

  if (!chat && !account?.chats_onboarded) {
    return (
      <Welcome />
    );
  }

  if (!chat) {
    return null;
  }

  return (
    <Stack className='h-full overflow-hidden'>
      <HStack alignItems='center' justifyContent='between' space={2} className='px-4 py-2 w-full'>
        <HStack alignItems='center' space={2} className='overflow-hidden'>
          <HStack alignItems='center'>
            <IconButton
              src={require('@tabler/icons/arrow-left.svg')}
              className='sm:hidden h-7 w-7 mr-2 sm:mr-0'
              onClick={() => setChat(null)}
            />

            <Avatar src={chat.account?.avatar} size={40} className='flex-none' />
          </HStack>

          <Stack alignItems='start' className='overflow-hidden'>
            <div className='flex items-center space-x-1 flex-grow w-full'>
              <Text weight='bold' size='sm' align='left' truncate>{chat.account?.display_name || `@${chat.account.username}`}</Text>
              {chat.account?.verified && <VerificationBadge />}
            </div>

            <Text
              align='left'
              size='sm'
              weight='medium'
              theme='muted'
              truncate
              className='w-full'
            >
              {chat.account.acct}
            </Text>
          </Stack>
        </HStack>

        <Menu>
          <MenuButton
            as={IconButton}
            src={require('@tabler/icons/info-circle.svg')}
            iconClassName='w-5 h-5 text-gray-600'
            children={null}
          />

          <MenuList className='w-80 py-6'>
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

              <Stack space={2}>
                <MenuItem
                  as='button'
                  onSelect={handleBlockUser}
                  className='!px-0 hover:!bg-transparent'
                >
                  <div className='w-full flex items-center space-x-2 font-bold text-sm text-primary-500 dark:text-accent-blue'>
                    <Icon src={require('@tabler/icons/ban.svg')} className='w-5 h-5' />
                    <span>{intl.formatMessage(messages.blockUser, { acct: chat.account.acct })}</span>
                  </div>
                </MenuItem>

                <MenuItem
                  as='button'
                  onSelect={handleReportChat}
                  className='!px-0 hover:!bg-transparent'
                >
                  <div className='w-full flex items-center space-x-2 font-bold text-sm text-primary-500 dark:text-accent-blue'>
                    <Icon src={require('@tabler/icons/flag.svg')} className='w-5 h-5' />
                    <span>{intl.formatMessage(messages.reportUser, { acct: chat.account.acct })}</span>
                  </div>
                </MenuItem>

                <MenuItem
                  as='button'
                  onSelect={handleLeaveChat}
                  className='!px-0 hover:!bg-transparent'
                >
                  <div className='w-full flex items-center space-x-2 font-bold text-sm text-danger-600 dark:text-danger-500'>
                    <Icon src={require('@tabler/icons/logout.svg')} className='w-5 h-5' />
                    <span>{intl.formatMessage(messages.leaveChat)}</span>
                  </div>
                </MenuItem>
              </Stack>
            </Stack>
          </MenuList>
        </Menu>
      </HStack>

      <div className='h-full overflow-hidden'>
        <Chat className='h-full overflow-hidden' chat={chat} />
      </div>
    </Stack>
  );
};

export default ChatPageMain;
