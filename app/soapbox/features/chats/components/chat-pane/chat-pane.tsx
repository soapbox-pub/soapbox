import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import sumBy from 'lodash/sumBy';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import snackbar from 'soapbox/actions/snackbar';
import { Avatar, HStack, Icon, Input, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification_badge';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch, useDebounce } from 'soapbox/hooks';
import { IChat, useChats } from 'soapbox/queries/chats';
import { queryClient } from 'soapbox/queries/client';
import useAccountSearch from 'soapbox/queries/search';

import ChatList from '../chat-list';
import ChatPaneHeader from '../chat-pane-header';
import ChatWindow from '../chat-window';
import { Pane } from '../ui';

const messages = defineMessages({
  searchPlaceholder: { id: 'chats.search_placeholder', defaultMessage: 'Type a name' },
});

const ChatPane = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const debounce = useDebounce;

  const { chat, setChat, isOpen, toggleChatPane } = useChatContext();
  const { chatsQuery: { data: chats }, getOrCreateChatByAccountId } = useChats();

  const [value, setValue] = useState<string>();
  const debouncedValue = debounce(value as string, 300);

  const { data: accounts } = useAccountSearch(debouncedValue);

  const unreadCount = sumBy(chats, (chat) => chat.unread);

  const isSearching = accounts && accounts.length > 0;
  const hasSearchValue = value && value.length > 0;

  const handleClickOnSearchResult = useMutation((accountId: string) => {
    return getOrCreateChatByAccountId(accountId);
  }, {
    onError: (error: AxiosError) => {
      const data = error.response?.data as any;
      dispatch(snackbar.error(data?.error));
    },
    onSuccess: (response) => {
      setChat(response.data);
      queryClient.invalidateQueries(['chats']);
    },
  });

  const handleClickChat = (chat: IChat) => setChat(chat);

  const clearValue = () => {
    if (hasSearchValue) {
      setValue('');
    }
  };

  const renderBody = () => {
    if (isSearching) {
      return (
        <Stack className='overflow-y-scroll flex-grow h-full' space={2}>
          {accounts.map((account: any) => (
            <button
              key={account.id}
              type='button'
              className='px-4 py-2 w-full flex flex-col hover:bg-gray-100 dark:hover:bg-gray-800'
              onClick={() => {
                handleClickOnSearchResult.mutate(account.id);
                clearValue();
              }}
            >
              <HStack alignItems='center' space={2}>
                <Avatar src={account.avatar} size={40} />

                <Stack alignItems='start'>
                  <div className='flex items-center space-x-1 flex-grow'>
                    <Text weight='bold' size='sm' truncate>{account.display_name}</Text>
                    {account.verified && <VerificationBadge />}
                  </div>
                  <Text size='sm' weight='medium' theme='muted' truncate>@{account.acct}</Text>
                </Stack>
              </HStack>
            </button>
          ))}
        </Stack>
      );
    } else {
      return <ChatList onClickChat={handleClickChat} fade />;
    }
  };

  // Active chat
  if (chat?.id) {
    return (
      <Pane isOpen={isOpen} index={0} main>
        <ChatWindow />
      </Pane>
    );
  }

  return (
    <Pane isOpen={isOpen} index={0} main>
      <ChatPaneHeader title='Messages' unreadCount={unreadCount} isOpen={isOpen} onToggle={toggleChatPane} />

      {isOpen ? (
        <Stack space={4} className='flex-grow h-full'>
          <div className='px-4'>
            <Input
              type='text'
              autoFocus
              placeholder={intl.formatMessage(messages.searchPlaceholder)}
              className='rounded-full'
              value={value || ''}
              onChange={(event) => setValue(event.target.value)}
              isSearch
              append={
                <button onClick={clearValue}>
                  <Icon
                    src={hasSearchValue ? require('@tabler/icons/x.svg') : require('@tabler/icons/search.svg')}
                    className='h-4 w-4 text-gray-700 dark:text-gray-600'
                    aria-hidden='true'
                  />
                </button>
              }
            />
          </div>

          {renderBody()}
        </Stack>
      ) : null}
    </Pane>
  );
};

export default ChatPane;
