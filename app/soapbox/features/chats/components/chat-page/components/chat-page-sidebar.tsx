import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { launchChat } from 'soapbox/actions/chats';
import AccountSearch from 'soapbox/components/account_search';
import { CardTitle, Stack } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch } from 'soapbox/hooks';

import ChatList from '../../chat-list';

import type { IChat } from 'soapbox/queries/chats';

const messages = defineMessages({
  title: { id: 'column.chats', defaultMessage: 'Messages' },
  searchPlaceholder: { id: 'chats.search_placeholder', defaultMessage: 'Start a chat with…' },
});

const ChatPageSidebar = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();

  const { setChat } = useChatContext();

  const handleSuggestion = (accountId: string) => {
    dispatch(launchChat(accountId, history, true));
  };

  const handleClickChat = (chat: IChat) => setChat(chat);

  return (
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
  );
};

export default ChatPageSidebar;