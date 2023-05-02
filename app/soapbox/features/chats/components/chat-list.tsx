import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { fetchChats } from 'soapbox/actions/chats';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import { Spinner, Stack } from 'soapbox/components/ui';
import PlaceholderChat from 'soapbox/features/placeholder/components/placeholder-chat';
import { useAppDispatch } from 'soapbox/hooks';
import { useChats } from 'soapbox/queries/chats';

import ChatListItem from './chat-list-item';

interface IChatList {
  onClickChat: (chat: any) => void
  useWindowScroll?: boolean
  searchValue?: string
}

const ChatList: React.FC<IChatList> = ({ onClickChat, useWindowScroll = false, searchValue }) => {
  const dispatch = useAppDispatch();

  const chatListRef = useRef(null);

  const { chatsQuery: { data: chats, isFetching, hasNextPage, fetchNextPage } } = useChats(searchValue);

  const [isNearBottom, setNearBottom] = useState<boolean>(false);
  const [isNearTop, setNearTop] = useState<boolean>(true);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => dispatch(fetchChats());

  const renderEmpty = () => {
    if (isFetching) {
      return (
        <Stack space={2}>
          <PlaceholderChat />
          <PlaceholderChat />
          <PlaceholderChat />
        </Stack>
      );
    }

    return null;
  };

  return (
    <div className='relative h-full'>
      <PullToRefresh onRefresh={handleRefresh}>
        <Virtuoso
          ref={chatListRef}
          atTopStateChange={(atTop) => setNearTop(atTop)}
          atBottomStateChange={(atBottom) => setNearBottom(atBottom)}
          useWindowScroll={useWindowScroll}
          data={chats}
          endReached={handleLoadMore}
          itemContent={(_index, chat) => (
            <div className='px-2'>
              <ChatListItem chat={chat} onClick={onClickChat} />
            </div>
          )}
          components={{
            ScrollSeekPlaceholder: () => <PlaceholderChat />,
            Footer: () => hasNextPage ? <Spinner withText={false} /> : null,
            EmptyPlaceholder: renderEmpty,
          }}
        />
      </PullToRefresh>

      <>
        <div
          className={clsx('pointer-events-none absolute inset-x-0 top-0 flex justify-center rounded-t-lg bg-gradient-to-b from-white to-transparent pb-12 pt-8 transition-opacity duration-500 dark:from-gray-900', {
            'opacity-0': isNearTop,
            'opacity-100': !isNearTop,
          })}
        />
        <div
          className={clsx('pointer-events-none absolute inset-x-0 bottom-0 flex justify-center rounded-b-lg bg-gradient-to-t from-white to-transparent pb-8 pt-12 transition-opacity duration-500 dark:from-gray-900', {
            'opacity-0': isNearBottom,
            'opacity-100': !isNearBottom,
          })}
        />
      </>
    </div>
  );
};

export default ChatList;
