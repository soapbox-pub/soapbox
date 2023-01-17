import { useMutation } from '@tanstack/react-query';
import classNames from 'clsx';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import escape from 'lodash/escape';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { Components, Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { openModal } from 'soapbox/actions/modals';
import { initReport } from 'soapbox/actions/reports';
import { Avatar, Button, Divider, HStack, Icon, IconButton, Spinner, Stack, Text } from 'soapbox/components/ui';
import DropdownMenuContainer from 'soapbox/containers/dropdown-menu-container';
import emojify from 'soapbox/features/emoji/emoji';
import PlaceholderChatMessage from 'soapbox/features/placeholder/components/placeholder-chat-message';
import Bundle from 'soapbox/features/ui/components/bundle';
import { MediaGallery } from 'soapbox/features/ui/util/async-components';
import { useAppSelector, useAppDispatch, useOwnAccount, useFeatures } from 'soapbox/hooks';
import { normalizeAccount } from 'soapbox/normalizers';
import { ChatKeys, IChat, IChatMessage, useChatActions, useChatMessages } from 'soapbox/queries/chats';
import { queryClient } from 'soapbox/queries/client';
import { stripHTML } from 'soapbox/utils/html';
import { onlyEmoji } from 'soapbox/utils/rich-content';

import ChatMessageListIntro from './chat-message-list-intro';

import type { Menu } from 'soapbox/components/dropdown-menu';
import type { ChatMessage as ChatMessageEntity } from 'soapbox/types/entities';

const BIG_EMOJI_LIMIT = 3;

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

const timeChange = (prev: IChatMessage, curr: IChatMessage): TimeFormat | null => {
  const prevDate = new Date(prev.created_at).getDate();
  const currDate = new Date(curr.created_at).getDate();
  const nowDate = new Date().getDate();

  if (prevDate !== currDate) {
    return currDate === nowDate ? 'today' : 'date';
  }

  return null;
};

const makeEmojiMap = (record: any) => record.get('emojis', ImmutableList()).reduce((map: ImmutableMap<string, any>, emoji: ImmutableMap<string, any>) => {
  return map.set(`:${emoji.get('shortcode')}:`, emoji);
}, ImmutableMap());

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
  chat: IChat,
}

/** Scrollable list of chat messages. */
const ChatMessageList: React.FC<IChatMessageList> = ({ chat }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const account = useOwnAccount();
  const features = useFeatures();

  const lastReadMessageDateString = chat.latest_read_message_by_account?.find((latest) => latest.id === chat.account.id)?.date;
  const myLastReadMessageDateString = chat.latest_read_message_by_account?.find((latest) => latest.id === account?.id)?.date;
  const lastReadMessageTimestamp = lastReadMessageDateString ? new Date(lastReadMessageDateString) : null;
  const myLastReadMessageTimestamp = myLastReadMessageDateString ? new Date(myLastReadMessageDateString) : null;

  const node = useRef<VirtuosoHandle>(null);
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX - 20);

  const { deleteChatMessage, markChatAsRead } = useChatActions(chat.id);
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

  const me = useAppSelector((state) => state.me);
  const isBlocked = useAppSelector((state) => state.getIn(['relationships', chat.account.id, 'blocked_by']));

  const handleDeleteMessage = useMutation((chatMessageId: string) => deleteChatMessage(chatMessageId), {
    onSettled: () => {
      queryClient.invalidateQueries(ChatKeys.chatMessages(chat.id));
    },
  });

  const lastChatMessage = chatMessages ? chatMessages[chatMessages.length - 1] : null;

  const cachedChatMessages = useMemo(() => {
    if (!chatMessages) {
      return [];
    }

    const nextFirstItemIndex = START_INDEX - chatMessages.length;
    setFirstItemIndex(nextFirstItemIndex);
    return chatMessages.reduce((acc: any, curr: any, idx: number) => {
      const lastMessage = formattedChatMessages[idx - 1];

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
              text: intl.formatDate(new Date(curr.created_at), { weekday: 'short', hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' }),
            });
            break;
        }
      }

      acc.push(curr);
      return acc;
    }, []);

  }, [chatMessages?.length, lastChatMessage]);

  const initialTopMostItemIndex = process.env.NODE_ENV === 'test' ? 0 : cachedChatMessages.length - 1;

  const getFormattedTimestamp = (chatMessage: ChatMessageEntity) => {
    return intl.formatDate(new Date(chatMessage.created_at), {
      hour12: false,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const setBubbleRef = (c: HTMLDivElement) => {
    if (!c) return;
    const links = c.querySelectorAll('a[rel="ugc"]');

    links.forEach(link => {
      link.classList.add('chat-link');
      link.setAttribute('rel', 'ugc nofollow noopener');
      link.setAttribute('target', '_blank');
    });
  };

  const handleStartReached = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
    return false;
  }, [firstItemIndex, hasNextPage, isFetching]);

  const onOpenMedia = (media: any, index: number) => {
    dispatch(openModal('MEDIA', { media, index }));
  };

  const maybeRenderMedia = (chatMessage: ChatMessageEntity) => {
    const { attachment } = chatMessage;
    if (!attachment) return null;
    return (
      <Bundle fetchComponent={MediaGallery}>
        {(Component: any) => (
          <Component
            media={ImmutableList([attachment])}
            onOpenMedia={onOpenMedia}
            visible
          />
        )}
      </Bundle>
    );
  };

  const parsePendingContent = (content: string) => {
    return escape(content).replace(/(?:\r\n|\r|\n)/g, '<br>');
  };

  const parseContent = (chatMessage: ChatMessageEntity) => {
    const content = chatMessage.content || '';
    const pending = chatMessage.pending;
    const deleting = chatMessage.deleting;
    const formatted = (pending && !deleting) ? parsePendingContent(content) : content;
    const emojiMap = makeEmojiMap(chatMessage);
    return emojify(formatted, emojiMap.toJS());
  };

  const renderDivider = (key: React.Key, text: string) => <Divider key={key} text={text} textSize='xs' />;

  const handleCopyText = (chatMessage: ChatMessageEntity) => {
    if (navigator.clipboard) {
      const text = stripHTML(chatMessage.content);
      navigator.clipboard.writeText(text);
    }
  };

  const renderMessage = (chatMessage: ChatMessageEntity) => {
    const content = parseContent(chatMessage);
    const hiddenEl = document.createElement('div');
    hiddenEl.innerHTML = content;
    const isOnlyEmoji = onlyEmoji(hiddenEl, BIG_EMOJI_LIMIT, false);

    const isMyMessage = chatMessage.account_id === me;
    // did this occur before this time?
    const isRead = isMyMessage
      && lastReadMessageTimestamp
      && lastReadMessageTimestamp >= new Date(chatMessage.created_at);

    const menu: Menu = [];

    if (navigator.clipboard && chatMessage.content) {
      menu.push({
        text: intl.formatMessage(messages.copy),
        action: () => handleCopyText(chatMessage),
        icon: require('@tabler/icons/copy.svg'),
      });
    }

    if (isMyMessage) {
      menu.push({
        text: intl.formatMessage(messages.delete),
        action: () => handleDeleteMessage.mutate(chatMessage.id),
        icon: require('@tabler/icons/trash.svg'),
        destructive: true,
      });
    } else {
      if (features.reportChats) {
        menu.push({
          text: intl.formatMessage(messages.report),
          action: () => dispatch(initReport(normalizeAccount(chat.account) as any, { chatMessage } as any)),
          icon: require('@tabler/icons/flag.svg'),
        });
      }
      menu.push({
        text: intl.formatMessage(messages.deleteForMe),
        action: () => handleDeleteMessage.mutate(chatMessage.id),
        icon: require('@tabler/icons/trash.svg'),
        destructive: true,
      });
    }

    return (
      <div key={chatMessage.id} className='group' data-testid='chat-message'>
        <Stack
          space={1.5}
          className={classNames({
            'ml-auto': isMyMessage,
          })}
        >
          <HStack
            alignItems='center'
            justifyContent={isMyMessage ? 'end' : 'start'}
            className={classNames({
              'opacity-50': chatMessage.pending,
            })}
          >
            {menu.length > 0 && (
              <div
                className={classNames({
                  'hidden focus:block group-hover:block text-gray-500': true,
                  'mr-2 order-1': isMyMessage,
                  'ml-2 order-2': !isMyMessage,
                })}
                data-testid='chat-message-menu'
              >
                <DropdownMenuContainer items={menu}>
                  <IconButton
                    src={require('@tabler/icons/dots.svg')}
                    title={intl.formatMessage(messages.more)}
                    className='text-gray-600 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-500'
                    iconClassName='w-4 h-4'
                  />
                </DropdownMenuContainer>
              </div>
            )}

            <Stack
              space={0.5}
              className={classNames({
                'max-w-[85%]': true,
                'flex-1': chatMessage.attachment,
                'order-2': isMyMessage,
                'order-1': !isMyMessage,
              })}
              alignItems={isMyMessage ? 'end' : 'start'}
            >
              {maybeRenderMedia(chatMessage)}

              {content && (
                <HStack alignItems='bottom'>
                  <div
                    title={getFormattedTimestamp(chatMessage)}
                    className={
                      classNames({
                        'text-ellipsis break-words relative rounded-md py-2 px-3 max-w-full space-y-2 [&_.mention]:underline': true,
                        '[&_.mention]:text-primary-600 dark:[&_.mention]:text-accent-blue': !isMyMessage,
                        '[&_.mention]:text-white dark:[&_.mention]:white': isMyMessage,
                        'bg-primary-500 text-white': isMyMessage,
                        'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100': !isMyMessage,
                        '!bg-transparent !p-0 emoji-lg': isOnlyEmoji,
                      })
                    }
                    ref={setBubbleRef}
                    tabIndex={0}
                  >
                    <Text
                      size='sm'
                      theme='inherit'
                      className='break-word-nested'
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                </HStack>
              )}
            </Stack>
          </HStack>

          <HStack
            alignItems='center'
            space={2}
            className={classNames({
              'ml-auto': isMyMessage,
            })}
          >
            <div
              className={classNames({
                'text-right': isMyMessage,
                'order-2': !isMyMessage,
              })}
            >
              <span className='flex items-center space-x-1.5'>
                <Text
                  theme='muted'
                  size='xs'
                >
                  {intl.formatTime(chatMessage.created_at)}
                </Text>

                {(isMyMessage && features.chatsReadReceipts) ? (
                  <>
                    {isRead ? (
                      <span className='rounded-full flex flex-col items-center justify-center p-0.5 bg-primary-500 text-white dark:bg-primary-400 dark:text-primary-900 border border-solid border-primary-500 dark:border-primary-400'>
                        <Icon src={require('@tabler/icons/check.svg')} strokeWidth={3} className='w-2.5 h-2.5' />
                      </span>
                    ) : (
                      <span className='rounded-full flex flex-col items-center justify-center p-0.5 bg-transparent text-primary-500 dark:text-primary-400 border border-solid border-primary-500 dark:border-primary-400'>
                        <Icon src={require('@tabler/icons/check.svg')} strokeWidth={3} className='w-2.5 h-2.5' />
                      </span>
                    )}
                  </>
                ) : null}
              </span>
            </div>
          </HStack>
        </Stack>
      </div>
    );
  };

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
      <Stack alignItems='center' justifyContent='center' className='h-full flex-grow'>
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
      <Stack alignItems='center' justifyContent='center' className='h-full flex-grow'>
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
      <div className='flex-grow flex flex-col justify-end pb-4'>
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
    <div className='h-full flex flex-col flex-grow space-y-6'>
      <div className='flex-grow flex flex-col justify-end'>
        <Virtuoso
          ref={node}
          alignToBottom
          firstItemIndex={Math.max(0, firstItemIndex)}
          initialTopMostItemIndex={initialTopMostItemIndex}
          data={cachedChatMessages}
          startReached={handleStartReached}
          followOutput='auto'
          itemContent={(index, chatMessage) => {
            if (chatMessage.type === 'divider') {
              return renderDivider(index, chatMessage.text);
            } else {
              return (
                <div className='px-4 py-2'>
                  {renderMessage(chatMessage)}
                </div>
              );
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
