import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import sumBy from 'lodash/sumBy';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { createSelector } from 'reselect';

import { openChat, launchChat, toggleMainWindow } from 'soapbox/actions/chats';
import { getSettings } from 'soapbox/actions/settings';
import snackbar from 'soapbox/actions/snackbar';
import AccountSearch from 'soapbox/components/account_search';
import { Avatar, Button, Counter, HStack, Icon, IconButton, Input, Spinner, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification_badge';
import AudioToggle from 'soapbox/features/chats/components/audio-toggle';
import PlaceholderAccount from 'soapbox/features/placeholder/components/placeholder_account';
import { useAppDispatch, useAppSelector, useDebounce, useSettings } from 'soapbox/hooks';
import { IChat, useChats } from 'soapbox/queries/chats';
import useAccountSearch from 'soapbox/queries/search';
import { RootState } from 'soapbox/store';
import { Chat } from 'soapbox/types/entities';

import ChatList from './chat-list';
import ChatPaneHeader from './chat-pane-header';
import ChatWindow from './chat-window';
import { Pane, WindowState } from './ui';

const messages = defineMessages({
  searchPlaceholder: { id: 'chats.search_placeholder', defaultMessage: 'Type a name' },
});

const getChatsUnreadCount = (state: RootState) => {
  const chats = state.chats.items;
  return chats.reduce((acc, curr) => acc + Math.min(curr.get('unread', 0), 1), 0);
};

// Filter out invalid chats
const normalizePanes = (chats: ImmutableMap<string, Chat>, panes = ImmutableList<ImmutableMap<string, any>>()) => (
  panes.filter(pane => chats.get(pane.get('chat_id')))
);

const makeNormalizeChatPanes = () => createSelector([
  (state: RootState) => state.chats.items,
  (state: RootState) => getSettings(state).getIn(['chats', 'panes']) as any,
], normalizePanes);

const normalizeChatPanes = makeNormalizeChatPanes();

const ChatPanes = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const debounce = useDebounce;

  const [chat, setChat] = useState<IChat | null>();
  const [value, setValue] = useState<string>();
  const debouncedValue = debounce(value as string, 300);

  const { chatsQuery: { data: chats, isFetching }, getOrCreateChatByAccountId } = useChats();
  const { data: accounts } = useAccountSearch(debouncedValue);

  const panes = useAppSelector((state) => normalizeChatPanes(state));
  const mainWindowState = useSettings().getIn(['chats', 'mainWindow']) as WindowState;
  const unreadCount = sumBy(chats, (chat) => chat.unread);

  const open = mainWindowState === 'open';
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
    },
  });


  const clearValue = () => {
    if (hasSearchValue) {
      setValue('');
    }
  };

  const handleMainWindowToggle = () => {
    if (mainWindowState === 'open') {
      setChat(null);
    }
    dispatch(toggleMainWindow());
  };

  const renderBody = () => {
    if (isFetching) {
      return (
        <div className='flex flex-grow h-full items-center justify-center'>
          <Spinner withText={false} />
        </div>
      );
    } else if (isSearching) {
      return (
        <Stack className='overflow-y-scroll flex-grow h-full' space={2}>
          {accounts.map((account: any) => (
            <button key={account.id} type='button' className='px-4 py-2 w-full flex flex-col hover:bg-gray-100' onClick={() => handleClickOnSearchResult.mutate(account.id)}>
              <HStack alignItems='center' space={2}>
                <Avatar src={account.avatar} size={40} />

                <Stack alignItems='start'>
                  <div className='flex items-center space-x-1 flex-grow'>
                    <Text weight='semibold' truncate>{account.display_name}</Text>
                    {account.verified && <VerificationBadge />}
                  </div>
                  <Text theme='muted' truncate>{account.acct}</Text>
                </Stack>
              </HStack>
            </button>
          ))}
        </Stack>
      );
    } else if (chats && chats.length > 0) {
      return (
        <Stack className='overflow-y-scroll flex-grow h-full' space={2}>
          {chats.map((chat) => (
            <button
              key={chat.id}
              type='button'
              onClick={() => setChat(chat)}
              className='px-4 py-2 w-full flex flex-col hover:bg-gray-100'
            >
              <HStack alignItems='center' space={2}>
                <Avatar src={chat.account.avatar} size={40} />

                <Stack alignItems='start'>
                  <div className='flex items-center space-x-1 flex-grow'>
                    <Text weight='semibold' truncate>{chat.account.display_name}</Text>
                    {chat.account.verified && <VerificationBadge />}
                  </div>
                  <Text theme='muted' truncate>{chat.account.acct}</Text>
                </Stack>
              </HStack>
            </button>
          ))}
        </Stack>
      );
    } else {
      return (
        <Stack justifyContent='center' alignItems='center' space={4} className='px-4 flex-grow'>
          <Stack space={2}>
            <Text weight='semibold' size='xl' align='center'>No messages yet</Text>
            <Text theme='muted' align='center'>You can start a conversation with anyone that follows you.</Text>
          </Stack>

          <Button theme='primary'>Message someone</Button>
        </Stack>
      );
    }
  };

  return (
    <div>
      <Pane windowState={mainWindowState} index={0} main>
        {chat?.id ? (
          <ChatWindow chat={chat} closeChat={() => setChat(null)} closePane={handleMainWindowToggle} />
        ) : (
          <>
            <ChatPaneHeader title='Messages' unreadCount={unreadCount} isOpen={open} onToggle={handleMainWindowToggle} />

            {open ? (
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
          </>
        )}
      </Pane>

      {/* {panes.map((pane, i) => (
        <ChatWindow
          idx={i + 1}
          key={pane.get('chat_id')}
          chatId={pane.get('chat_id')}
          windowState={pane.get('state')}
        />
      ))} */}
    </div>
  );
};

export default ChatPanes;
