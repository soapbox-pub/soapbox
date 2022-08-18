import React from 'react';
import { useDispatch } from 'react-redux';
import { Virtuoso } from 'react-virtuoso';

import { fetchChats } from 'soapbox/actions/chats';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import { Stack } from 'soapbox/components/ui';
import PlaceholderChat from 'soapbox/features/placeholder/components/placeholder-chat';
import { useChats } from 'soapbox/queries/chats';

import Chat from './chat';
import Blankslate from './chat-pane/blankslate';

interface IChatList {
  onClickChat: (chat: any) => void,
  useWindowScroll?: boolean,
}

const ChatList: React.FC<IChatList> = ({ onClickChat, useWindowScroll = false }) => {
  const dispatch = useDispatch();

  const { chatsQuery: { data: chats, isFetching } } = useChats();

  const isEmpty = chats?.length === 0;

  // const handleLoadMore = useCallback(() => {
  //   if (hasMore && !isLoading) {
  //     dispatch(expandChats());
  //   }
  // }, [dispatch, hasMore, isLoading]);

  const handleLoadMore = () => console.log('load more');


  const handleRefresh = () => {
    return dispatch(fetchChats()) as any;
  };

  const renderEmpty = () => {
    if (isFetching) {
      return (
        <Stack space={2}>
          <PlaceholderChat />
          <PlaceholderChat />
          <PlaceholderChat />
        </Stack>
      );
    } else {
      return <Blankslate />;
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {isEmpty ? renderEmpty() : (
        <Virtuoso
          useWindowScroll={useWindowScroll}
          data={chats}
          endReached={handleLoadMore}
          itemContent={(_index, chat) => (
            <Chat chat={chat} onClick={onClickChat} />
          )}
          components={{
            ScrollSeekPlaceholder: () => <PlaceholderChat />,
            // Footer: () => hasMore ? <PlaceholderChat /> : null,
            EmptyPlaceholder: renderEmpty,
          }}
        />
      )}
    </PullToRefresh>
  );
};

export default ChatList;
