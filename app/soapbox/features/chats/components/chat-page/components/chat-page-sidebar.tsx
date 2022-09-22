import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import snackbar from 'soapbox/actions/snackbar';
import AccountSearch from 'soapbox/components/account_search';
import { CardTitle, Stack } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch } from 'soapbox/hooks';
import { IChat, useChats } from 'soapbox/queries/chats';
import { queryClient } from 'soapbox/queries/client';

import ChatList from '../../chat-list';

const messages = defineMessages({
  title: { id: 'column.chats', defaultMessage: 'Messages' },
  searchPlaceholder: { id: 'chats.search_placeholder', defaultMessage: 'Start a chat with…' },
});

const ChatPageSidebar = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { setChat } = useChatContext();
  const { getOrCreateChatByAccountId } = useChats();

  const handleSuggestion = (accountId: string) => {
    handleClickOnSearchResult.mutate(accountId);
  };

  const handleClickOnSearchResult = useMutation((accountId: string) => {
    return getOrCreateChatByAccountId(accountId);
  }, {
    onError: (error: AxiosError) => {
      const data = error.response?.data as any;
      dispatch(snackbar.error(data?.error));
    },
    onSuccess: (response) => {
      setChat(response.data);
      queryClient.invalidateQueries(['chats', 'search']);
    },
  });

  const handleClickChat = (chat: IChat) => setChat(chat);

  return (
    <Stack space={4} className='h-full'>
      <Stack space={4} className='px-4 pt-4'>
        <CardTitle title={intl.formatMessage(messages.title)} />

        <AccountSearch
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
          onSelected={handleSuggestion}
        />
      </Stack>

      <Stack className='flex-grow h-full'>
        <ChatList onClickChat={handleClickChat} />
      </Stack>
    </Stack>
  );
};

export default ChatPageSidebar;