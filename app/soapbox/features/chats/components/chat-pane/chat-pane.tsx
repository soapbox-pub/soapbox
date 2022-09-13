import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import sumBy from 'lodash/sumBy';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import snackbar from 'soapbox/actions/snackbar';
import { Avatar, Button, HStack, Icon, Input, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification_badge';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch, useDebounce } from 'soapbox/hooks';
import { IChat, useChats } from 'soapbox/queries/chats';
import { queryClient } from 'soapbox/queries/client';
import useAccountSearch from 'soapbox/queries/search';

import ChatList from '../chat-list';
import ChatPaneHeader from '../chat-pane-header';
import ChatSearch from '../chat-search/chat-search';
import ChatWindow from '../chat-window';
import { Pane } from '../ui';

const messages = defineMessages({
  searchPlaceholder: { id: 'chats.search_placeholder', defaultMessage: 'Search inbox' },
});

const ChatPane = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const debounce = useDebounce;

  const [value, setValue] = useState<string>();
  const debouncedValue = debounce(value as string, 300);

  const { chat, setChat, isOpen, isSearching, setSearching, toggleChatPane } = useChatContext();
  const { chatsQuery: { data: chats } } = useChats(debouncedValue);
  // const chats: IChat[] = [];

  // Screens
  // 1. Search + Chats
  // 2. Search + empty
  // 3. User search


  const unreadCount = sumBy(chats, (chat) => chat.unread);

  const hasSearchValue = Number(value?.length) > 0;

  const handleClickChat = (chat: IChat) => {
    setChat(chat);
    setValue(undefined);
  };

  const clearValue = () => {
    if (hasSearchValue) {
      setValue('');
    }
  };

  const renderBody = () => {
    if (hasSearchValue || Number(chats?.length) > 0) {
      return (
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

          {Number(chats?.length) > 0 ? (
            <ChatList
              searchValue={debouncedValue}
              onClickChat={handleClickChat}
              fade
            />
          ) : (
            <Text>no results</Text>
          )}
        </Stack>
      );
    } else if (chats?.length === 0) {
      return (
        <Stack alignItems='center' justifyContent='center' className='h-full flex-grow'>
          <Stack space={4}>
            <Stack space={1} className='max-w-[85%] mx-auto'>
              <Text size='lg' weight='bold' align='center'>No messages yet</Text>
              <Text theme='muted' align='center'>
                You can start a conversation with anyone that follows you.
              </Text>
            </Stack>

            <div className='mx-auto'>
              <Button theme='primary' onClick={() => setSearching(true)}>
                Message someone
              </Button>
            </div>
          </Stack>
        </Stack>
      );
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

  if (isSearching) {
    return <ChatSearch />;
  }

  return (
    <Pane isOpen={isOpen} index={0} main>
      <ChatPaneHeader
        title='Messages'
        unreadCount={unreadCount}
        isOpen={isOpen}
        onToggle={toggleChatPane}
        secondaryAction={() => {
          setSearching(true);
          setValue(undefined);
        }}
        secondaryActionIcon={require('@tabler/icons/edit.svg')}
      />

      {isOpen ? renderBody() : null}
    </Pane>
  );
};

export default ChatPane;
