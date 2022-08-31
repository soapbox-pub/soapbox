import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { launchChat } from 'soapbox/actions/chats';
import AccountSearch from 'soapbox/components/account_search';

import { Card, CardTitle, Stack } from '../../components/ui';

import ChatList from './components/chat-list';

const messages = defineMessages({
  title: { id: 'column.chats', defaultMessage: 'Messages' },
  searchPlaceholder: { id: 'chats.search_placeholder', defaultMessage: 'Start a chat with…' },
});

const ChatIndex: React.FC = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const history = useHistory();

  const handleSuggestion = (accountId: string) => {
    dispatch(launchChat(accountId, history, true));
  };

  const handleClickChat = (chat: { id: string }) => {
    history.push(`/chats/${chat.id}`);
  };

  return (
    <Card className='p-0' variant='rounded'>
      <div className='grid grid-cols-9'>
        <Stack className='col-span-3 p-6 bg-gradient-to-r from-white to-gray-100' space={6}>
          <CardTitle title={intl.formatMessage(messages.title)} />

          <AccountSearch
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
            onSelected={handleSuggestion}
          />

          <div className='-mx-3'>
            <ChatList
              onClickChat={handleClickChat}
              useWindowScroll
            />
          </div>
        </Stack>
        <Stack className='col-span-6'>Message area</Stack>
      </div>
    </Card>
  );
};

export default ChatIndex;
