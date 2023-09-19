import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { Components, Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { Avatar, Button, Divider, Spinner, Stack, Text } from 'soapbox/components/ui';
import PlaceholderChatMessage from 'soapbox/features/placeholder/components/placeholder-chat-message';
import { useAppSelector, useOwnAccount } from 'soapbox/hooks';
import { IChat, useChatActions, useChatMessages } from 'soapbox/queries/chats';

import ChatMessage from './chat-message';
import ChatMessageListIntro from './chat-message-list-intro';

import type { ChatMessage as ChatMessageEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  today: { id: 'chats.dividers.today', defaultMessage: 'Today' },
  more: { id: 'chats.actions.more', defaultMessage: 'More' },
  delete: { id: 'chats.actions.delete', defaultMessage: 'Delete for both' },
  copy: { id: 'chats.actions.copy', defaultMessage: 'Copy' },
  report: { id: 'chats.actions.report', defaultMessage: 'Report' },
  deleteForMe: { id: 'chats.actions.deleteForMe', defaultMessage: 'Delete for me' },
  blockedBy: { id: 'chat_message_list.blockedBy', defaultMessage: 'You are blocked by' },
  networkFailureTitle: { id: 'chat_message_list.network_failure.title', defaultMessage: 'Whoops!' },
  networkFailureSubtitle: { id: 'chat_message_list.network_failure.subtitle', defaultMessage: 'We encountered a network failure.' },
  networkFailureAction: { id: 'chat_message_list.network_failure.action', defaultMessage: 'Try again' },
});

type TimeFormat = 'today' | 'date';

const timeChange = (prev: ChatMessageEntity, curr: ChatMessageEntity): TimeFormat | null => {
  const prevDate = new Date(prev.created_at).getDate();
  const currDate = new Date(curr.created_at).getDate();
  const nowDate = new Date().getDate();

  if (prevDate !== currDate) {
    return currDate === nowDate ? 'today' : 'date';
  }

  return null;
};

const START_INDEX = 10000;

const List: Components['List'] = React.forwardRef((props, ref) => {
  const { context, ...rest } = props;
  return <div ref={ref} {...rest} className='mb-2' />;
});

const Scroller: Components['Scroller'] = React.forwardRef((props, ref) => {
  const { style, context, ...rest } = props;

  return (
    <div
      {...rest}
      ref={ref}
      style={{
        ...style,
        scrollbarGutter: 'stable',
      }}
    />
  );
});

interface IChatMessageList {
  /** Chat the messages are being rendered from. */
  chat: IChat
}

/** Scrollable list of chat messages. */
const ChatMessageList: React.FC<IChatMessageList> = ({ chat }) => {
  const intl = useIntl();
  const { account } = useOwnAccount();

  const myLastReadMessageDateString = chat.latest_read_message_by_account?.find((latest) => latest.id === account?.id)?.date;
  const myLastReadMessageTimestamp = myLastReadMessageDateString ? new Date(myLastReadMessageDateString) : null;

  const node = useRef<VirtuosoHandle>(null);
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX - 20);

  const { markChatAsRead } = useChatActions(chat.id);
  const {
    data: chatMessages,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useChatMessages(chat);

  const formattedChatMessages = chatMessages || [];

  const isBlocked = useAppSelector((state) => state.getIn(['relationships', chat.account.id, 'blocked_by']));

  const lastChatMessage = chatMessages ? chatMessages[chatMessages.length - 1] : null;

  useEffect(() => {
    if (!chatMessages) {
      return;
    }

    const nextFirstItemIndex = START_INDEX - chatMessages.length;
    setFirstItemIndex(nextFirstItemIndex);
  }, [lastChatMessage]);

  const buildCachedMessages = () => {
    if (!chatMessages) {
      return [];
    }

    const currentYear = new Date().getFullYear();

    return chatMessages.reduce((acc: any, curr: any, idx: number) => {
      const lastMessage = formattedChatMessages[idx - 1];

      const messageDate = new Date(curr.created_at);

      if (lastMessage) {
        switch (timeChange(lastMessage, curr)) {
          case 'today':
            acc.push({
              type: 'divider',
              text: intl.formatMessage(messages.today),
            });
            break;
          case 'date':
            acc.push({
              type: 'divider',
              text: intl.formatDate(messageDate, {
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit',
                month: 'short',
                day: 'numeric',
                year: messageDate.getFullYear() !== currentYear ? '2-digit' : undefined,
              }),
            });
            break;
        }
      }

      acc.push(curr);
      return acc;
    }, []);
  };
  const cachedChatMessages = buildCachedMessages();

  const initialScrollPositionProps = useMemo(() => {
    if (process.env.NODE_ENV === 'test') {
      return {};
    }

    return {
      initialTopMostItemIndex: cachedChatMessages.length - 1,
      firstItemIndex: Math.max(0, firstItemIndex),
    };
  }, [cachedChatMessages.length, firstItemIndex]);

  const handleStartReached = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
    return false;
  }, [firstItemIndex, hasNextPage, isFetching]);

  const renderDivider = (key: React.Key, text: string) => <Divider key={key} text={text} textSize='xs' />;

  useEffect(() => {
    const lastMessage = formattedChatMessages[formattedChatMessages.length - 1];
    if (!lastMessage) {
      return;
    }

    const lastMessageId = lastMessage.id;
    const isMessagePending = lastMessage.pending;
    const isAlreadyRead = myLastReadMessageTimestamp ? myLastReadMessageTimestamp >= new Date(lastMessage.created_at) : false;

    /**
     * Only "mark the message as read" if..
     * 1) it is not pending and
     * 2) it has not already been read
    */
    if (!isMessagePending && !isAlreadyRead) {
      markChatAsRead(lastMessageId);
    }
  }, [formattedChatMessages.length]);

  if (isBlocked) {
    return (
      <Stack alignItems='center' justifyContent='center' className='h-full grow'>
        <Stack alignItems='center' space={2}>
          <Avatar src={chat.account.avatar} size={75} />
          <Text align='center'>
            <>
              <Text tag='span'>{intl.formatMessage(messages.blockedBy)}</Text>
              {' '}
              <Text tag='span' theme='primary'>@{chat.account.acct}</Text>
            </>
          </Text>
        </Stack>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Stack alignItems='center' justifyContent='center' className='h-full grow'>
        <Stack space={4}>
          <Stack space={1}>
            <Text size='lg' weight='bold' align='center'>
              {intl.formatMessage(messages.networkFailureTitle)}
            </Text>
            <Text theme='muted' align='center'>
              {intl.formatMessage(messages.networkFailureSubtitle)}
            </Text>
          </Stack>

          <div className='mx-auto'>
            <Button theme='primary' onClick={() => refetch()}>
              {intl.formatMessage(messages.networkFailureAction)}
            </Button>
          </div>
        </Stack>
      </Stack>
    );
  }

  if (isLoading) {
    return (
      <div className='flex grow flex-col justify-end pb-4'>
        <div className='px-4'>
          <PlaceholderChatMessage isMyMessage />
          <PlaceholderChatMessage />
          <PlaceholderChatMessage isMyMessage />
          <PlaceholderChatMessage isMyMessage />
          <PlaceholderChatMessage />
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full grow flex-col space-y-6'>
      <div className='flex grow flex-col justify-end'>
        <Virtuoso
          ref={node}
          alignToBottom
          {...initialScrollPositionProps}
          data={cachedChatMessages}
          startReached={handleStartReached}
          followOutput='auto'
          itemContent={(index, chatMessage) => {
            if (chatMessage.type === 'divider') {
              return renderDivider(index, chatMessage.text);
            } else {
              return <ChatMessage chat={chat} chatMessage={chatMessage} />;
            }
          }}
          components={{
            List,
            Scroller,
            Header: () => {
              if (hasNextPage || isFetchingNextPage) {
                return <Spinner withText={false} />;
              }

              if (!hasNextPage && !isLoading) {
                return <ChatMessageListIntro />;
              }

              return null;
            },
          }}
        />
      </div>
    </div>
  );
};

export default ChatMessageList;
