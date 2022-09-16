import classNames from 'clsx';
import React, { useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { fetchChats } from 'soapbox/actions/chats';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import { Stack } from 'soapbox/components/ui';
import PlaceholderChat from 'soapbox/features/placeholder/components/placeholder-chat';
import { useAppDispatch } from 'soapbox/hooks';
import { useChats, useChatSilences } from 'soapbox/queries/chats';

import ChatListItem from './chat-list-item';

interface IChatList {
  onClickChat: (chat: any) => void,
  useWindowScroll?: boolean,
  fade?: boolean,
  searchValue?: string
}

const ChatList: React.FC<IChatList> = ({ onClickChat, useWindowScroll = false, searchValue, fade }) => {
  const dispatch = useAppDispatch();

  const chatListRef = useRef(null);

  const { chatsQuery: { data: chats, isFetching, hasNextPage, fetchNextPage } } = useChats(searchValue);

  const { data: chatSilences } = useChatSilences();

  const [isNearBottom, setNearBottom] = useState<boolean>(false);
  const [isNearTop, setNearTop] = useState<boolean>(true);

  const isEmpty = (!chats || chats.length === 0);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => dispatch(fetchChats()) as any;

  const renderEmpty = () => (
    <Stack space={2}>
      <PlaceholderChat />
      <PlaceholderChat />
      <PlaceholderChat />
    </Stack>
  );

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
            itemContent={(_index, chat) => {
              const chatSilence = chatSilences?.find((chatSilence) => String(chatSilence.target_account_id) === chat.account.id);
              return <ChatListItem chat={chat} onClick={onClickChat} chatSilence={chatSilence} />;
            }}
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
