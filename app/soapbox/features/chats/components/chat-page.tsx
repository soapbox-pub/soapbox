import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { launchChat } from 'soapbox/actions/chats';
import AccountSearch from 'soapbox/components/account_search';
import { Card, CardTitle, Stack } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch } from 'soapbox/hooks';

import Chat from './chat';
import ChatList from './chat-list';
import ChatListItem from './chat-list-item';


const messages = defineMessages({
  title: { id: 'column.chats', defaultMessage: 'Messages' },
  searchPlaceholder: { id: 'chats.search_placeholder', defaultMessage: 'Start a chat with…' },
});


const ChatPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { chat, setChat } = useChatContext();

  const handleSuggestion = (accountId: string) => {
    dispatch(launchChat(accountId, history, true));
  };

  const handleClickChat = (chat: any) => {
    // history.push(`/chats/${chat.id}`);
    setChat(chat);
  };

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
              <ChatListItem chat={chat} onClick={() => { }} />
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