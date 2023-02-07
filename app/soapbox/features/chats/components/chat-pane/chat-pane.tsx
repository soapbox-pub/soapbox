import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Stack } from 'soapbox/components/ui';
import { ChatWidgetScreens, useChatContext } from 'soapbox/contexts/chat-context';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { useDebounce, useFeatures } from 'soapbox/hooks';
import { IChat, useChats } from 'soapbox/queries/chats';

import ChatList from '../chat-list';
import ChatSearchInput from '../chat-search-input';
import ChatSearch from '../chat-search/chat-search';
import EmptyResultsBlankslate from '../chat-search/empty-results-blankslate';
import ChatPaneHeader from '../chat-widget/chat-pane-header';
import ChatWindow from '../chat-widget/chat-window';
import ChatSearchHeader from '../chat-widget/headers/chat-search-header';
import { Pane } from '../ui';

import Blankslate from './blankslate';

const ChatPane = () => {
  const features = useFeatures();
  const debounce = useDebounce;
  const { unreadChatsCount } = useStatContext();

  const [value, setValue] = useState<string>();
  const debouncedValue = debounce(value as string, 300);

  const { screen, changeScreen, isOpen, toggleChatPane } = useChatContext();
  const { chatsQuery: { data: chats, isLoading } } = useChats(debouncedValue);

  const hasSearchValue = Number(debouncedValue?.length) > 0;

  const handleClickChat = (nextChat: IChat) => {
    changeScreen(ChatWidgetScreens.CHAT, nextChat.id);
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
        <Stack space={4} className='h-full grow'>
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
        <Blankslate
          onSearch={() => {
            changeScreen(ChatWidgetScreens.SEARCH);
          }}
        />
      );
    }
  };

  // Active chat
  if (screen === ChatWidgetScreens.CHAT || screen === ChatWidgetScreens.CHAT_SETTINGS) {
    return (
      <Pane isOpen={isOpen} index={0} main>
        <ChatWindow />
      </Pane>
    );
  }

  if (screen === ChatWidgetScreens.SEARCH) {
    return (
      <Pane isOpen={isOpen} index={0} main>
        <ChatSearchHeader />

        {isOpen ? <ChatSearch /> : null}
      </Pane>
    );
  }

  return (
    <Pane isOpen={isOpen} index={0} main>
      <ChatPaneHeader
        title={<FormattedMessage id='column.chats' defaultMessage='Chats' />}
        unreadCount={unreadChatsCount}
        isOpen={isOpen}
        onToggle={toggleChatPane}
        secondaryAction={() => {
          changeScreen(ChatWidgetScreens.SEARCH);
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
