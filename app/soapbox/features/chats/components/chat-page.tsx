import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { blockAccount } from 'soapbox/actions/accounts';
import { launchChat } from 'soapbox/actions/chats';
import { openModal } from 'soapbox/actions/modals';
import { initReport } from 'soapbox/actions/reports';
import AccountSearch from 'soapbox/components/account_search';
import List, { ListItem } from 'soapbox/components/list';
import { Avatar, Card, CardTitle, Divider, HStack, Icon, IconButton, Menu, MenuButton, MenuItem, MenuList, Stack, Text, Toggle } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification_badge';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch } from 'soapbox/hooks';
import { useChat, useChatSilences } from 'soapbox/queries/chats';

import Chat from './chat';
import ChatList from './chat-list';

const messages = defineMessages({
  title: { id: 'column.chats', defaultMessage: 'Messages' },
  searchPlaceholder: { id: 'chats.search_placeholder', defaultMessage: 'Start a chat with…' },
  blockMessage: { id: 'chat_settings.block.message', defaultMessage: 'Blocking will prevent this profile from direct messaging you and viewing your content. You can unblock later.' },
  blockHeading: { id: 'chat_settings.block.heading', defaultMessage: 'Block @{acct}' },
  blockConfirm: { id: 'chat_settings.block.confirm', defaultMessage: 'Block' },
  leaveMessage: { id: 'chat_settings.leave.message', defaultMessage: 'Are you sure you want to leave this chat? This conversation will be removed from your inbox.' },
  leaveHeading: { id: 'chat_settings.leave.heading', defaultMessage: 'Leave Chat' },
  leaveConfirm: { id: 'chat_settings.leave.confirm', defaultMessage: 'Leave Chat' },
  blockUser: { id: 'chat_settings.options.block_user', defaultMessage: 'Block @{acct}' },
  reportUser: { id: 'chat_settings.options.report_user', defaultMessage: 'Report @{acct}' },
  leaveChat: { id: 'chat_settings.options.leave_chat', defaultMessage: 'Leave Chat' },
});

const ChatPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { isSilenced, handleSilence } = useChatSilences();
  const { chat, setChat } = useChatContext();
  const { deleteChat } = useChat(chat?.id as string);

  const handleSuggestion = (accountId: string) => {
    dispatch(launchChat(accountId, history, true));
  };

  const handleClickChat = (chat: any) => {
    // history.push(`/chats/${chat.id}`);
    setChat(chat);
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

  const handleReportChat = () => dispatch(initReport(chat?.account as any));

  return (
    <Card className='p-0 h-[calc(100vh-176px)] overflow-hidden' variant='rounded'>
      <div className='grid grid-cols-9 overflow-hidden h-full dark:divide-x-2 dark:divide-solid dark:divide-gray-800'>
        <Stack
          className='col-span-3 p-6 bg-gradient-to-r from-white to-gray-100 dark:bg-gray-900 dark:bg-none overflow-hidden dark:inset'
          space={6}
        >
          <CardTitle title={intl.formatMessage(messages.title)} />

          <AccountSearch
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
            onSelected={handleSuggestion}
          />

          <Stack className='-mx-3 flex-grow h-full'>
            <ChatList onClickChat={handleClickChat} />
          </Stack>
        </Stack>

        <Stack className='col-span-6 h-full overflow-hidden'>
          {chat && (
            <Stack className='h-full overflow-hidden'>
              <HStack alignItems='center' justifyContent='between' space={2} className='px-4 py-2 w-full'>
                <HStack alignItems='center' space={2} className='overflow-hidden'>
                  <Avatar src={chat.account?.avatar} size={40} className='flex-none' />

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
          )}
        </Stack>
      </div>
    </Card>
  );
};

export default ChatPage;
