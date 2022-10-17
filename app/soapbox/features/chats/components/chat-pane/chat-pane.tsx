import React, { useState } from 'react';

import { Stack } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { useDebounce, useFeatures } from 'soapbox/hooks';
import { IChat, useChats } from 'soapbox/queries/chats';

import ChatList from '../chat-list';
import ChatSearchInput from '../chat-search-input';
import ChatSearch from '../chat-search/chat-search';
import EmptyResultsBlankslate from '../chat-search/empty-results-blankslate';
import ChatPaneHeader from '../chat-widget/chat-pane-header';
import ChatWindow from '../chat-widget/chat-window';
import { Pane } from '../ui';

import Blankslate from './blankslate';

const ChatPane = () => {
  const features = useFeatures();
  const debounce = useDebounce;
  const { unreadChatsCount } = useStatContext();

  const [value, setValue] = useState<string>();
  const debouncedValue = debounce(value as string, 300);

  const { chat, setChat, isOpen, isSearching, setSearching, toggleChatPane } = useChatContext();
  const { chatsQuery: { data: chats, isLoading } } = useChats(debouncedValue);

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
    if (hasSearchValue || Number(chats?.length) > 0 || isLoading) {
      return (
        <Stack space={4} className='flex-grow h-full'>
          {features.chatsSearch && (
            <div className='px-4'>
              <ChatSearchInput
                value={value || ''}
                onChange={(event) => setValue(event.target.value)}
                onClear={clearValue}
              />
            </div>
          )}

          {(Number(chats?.length) > 0 || isLoading) ? (
            <ChatList
              searchValue={debouncedValue}
              onClickChat={handleClickChat}
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
        unreadCount={unreadChatsCount}
        isOpen={isOpen}
        onToggle={toggleChatPane}
        secondaryAction={() => {
          setSearching(true);
          setValue(undefined);

          if (!isOpen) {
            toggleChatPane();
          }
        }}
        secondaryActionIcon={require('@tabler/icons/edit.svg')}
      />

      {isOpen ? renderBody() : null}
    </Pane>
  );
};

export default ChatPane;
