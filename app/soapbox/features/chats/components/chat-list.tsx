import classNames from 'clsx';
import React, { useRef, useState } from 'react';
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
  fade?: boolean,
}

const ChatList: React.FC<IChatList> = ({ onClickChat, useWindowScroll = false, fade }) => {
  const dispatch = useDispatch();

  const chatListRef = useRef(null);

  const { chatsQuery: { data: chats, isFetching, hasNextPage, fetchNextPage } } = useChats();

  const [isNearBottom, setNearBottom] = useState<boolean>(false);
  const [isNearTop, setNearTop] = useState<boolean>(true);

  const isEmpty = (!chats || chats.length === 0);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

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
    <div className='relative h-full'>
      <PullToRefresh onRefresh={handleRefresh}>
        {isEmpty ? renderEmpty() : (
          <Virtuoso
            ref={chatListRef}
            atTopStateChange={(atTop) => setNearTop(atTop)}
            atBottomStateChange={(atBottom) => setNearBottom(atBottom)}
            useWindowScroll={useWindowScroll}
            data={chats}
            endReached={handleLoadMore}
            itemContent={(_index, chat) => <Chat chat={chat} onClick={onClickChat} />}
            components={{
              ScrollSeekPlaceholder: () => <PlaceholderChat />,
              // Footer: () => hasNextPage ? <Spinner withText={false} /> : null,
              EmptyPlaceholder: renderEmpty,
            }}
          />
        )}
      </PullToRefresh>

      {fade && (
        <>
          <div
            className={classNames('inset-x-0 top-0 flex rounded-t-lg justify-center bg-gradient-to-b from-white pb-12 pt-8 pointer-events-none dark:from-gray-900 absolute transition-opacity duration-500', {
              'opacity-0': isNearTop,
              'opacity-100': !isNearTop,
            })}
          />
          <div
            className={classNames('inset-x-0 bottom-0 flex rounded-b-lg justify-center bg-gradient-to-t from-white pt-12 pb-8 pointer-events-none dark:from-gray-900 absolute transition-opacity duration-500', {
              'opacity-0': isNearBottom,
              'opacity-100': !isNearBottom,
            })}
          />
        </>
      )}
    </div>
  );
};

export default ChatList;
