import sumBy from 'lodash/sumBy';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Icon, Input, Stack } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useDebounce } from 'soapbox/hooks';
import { IChat, useChats } from 'soapbox/queries/chats';

import ChatList from '../chat-list';
import ChatPaneHeader from '../chat-pane-header';
import ChatSearch from '../chat-search/chat-search';
import EmptyResultsBlankslate from '../chat-search/empty-results-blankslate';
import ChatWindow from '../chat-window';
import { Pane } from '../ui';

import Blankslate from './blankslate';

const messages = defineMessages({
  searchPlaceholder: { id: 'chats.search_placeholder', defaultMessage: 'Search inbox' },
});

const ChatPane = () => {
  const intl = useIntl();
  const debounce = useDebounce;

  const [value, setValue] = useState<string>();
  const debouncedValue = debounce(value as string, 300);

  const { chat, setChat, isOpen, isSearching, setSearching, toggleChatPane } = useChatContext();
  const { chatsQuery: { data: chats } } = useChats(debouncedValue);

  const unreadCount = sumBy(chats, (chat) => chat.unread);

  const hasSearchValue = Number(debouncedValue?.length) > 0;

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
            <EmptyResultsBlankslate />
          )}
        </Stack>
      );
    } else if (chats?.length === 0) {
      return (
        <Blankslate onSearch={() => setSearching(true)} />
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
