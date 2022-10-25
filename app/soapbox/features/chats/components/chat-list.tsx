import classNames from 'clsx';
import React, { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Virtuoso } from 'react-virtuoso';

import { fetchChats } from 'soapbox/actions/chats';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import { Spinner, Stack, Text } from 'soapbox/components/ui';
import PlaceholderChat from 'soapbox/features/placeholder/components/placeholder-chat';
import { useAppDispatch } from 'soapbox/hooks';
import { useChats } from 'soapbox/queries/chats';

import ChatListItem from './chat-list-item';

interface IChatList {
  onClickChat: (chat: any) => void,
  useWindowScroll?: boolean,
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
    } else {
      return (
        <Stack className='p-6' space={2}>
          <Text size='2xl' weight='bold' tag='h3'>
            <FormattedMessage
              id='chats.getting_started.title'
              defaultMessage='Getting started'
            />
          </Text>

          <Text theme='muted'>
            <FormattedMessage
              id='chats.getting_started.hint'
              defaultMessage='To start a chat, search for a user in the field above.'
            />
          </Text>
        </Stack>
      );
    }
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
          )
          }
          components={{
            ScrollSeekPlaceholder: () => <PlaceholderChat />,
            Footer: () => hasNextPage ? <Spinner withText={false} /> : null,
            EmptyPlaceholder: renderEmpty,
          }}
        />
      </PullToRefresh>

      <>
        <div
          className={classNames('inset-x-0 top-0 flex rounded-t-lg justify-center bg-gradient-to-b from-white to-transparent pb-12 pt-8 pointer-events-none dark:from-gray-900 absolute transition-opacity duration-500', {
            'opacity-0': isNearTop,
            'opacity-100': !isNearTop,
          })}
        />
        <div
          className={classNames('inset-x-0 bottom-0 flex rounded-b-lg justify-center bg-gradient-to-t from-white to-transparent pt-12 pb-8 pointer-events-none dark:from-gray-900 absolute transition-opacity duration-500', {
            'opacity-0': isNearBottom,
            'opacity-100': !isNearBottom,
          })}
        />
      </>
    </div>
  );
};

export default ChatList;
