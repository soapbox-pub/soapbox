import { useMutation } from '@tanstack/react-query';
import classNames from 'clsx';
import { List as ImmutableList } from 'immutable';
import escape from 'lodash/escape';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { openModal } from 'soapbox/actions/modals';
import { initReport } from 'soapbox/actions/reports';
import { Avatar, Button, Divider, HStack, Spinner, Stack, Text } from 'soapbox/components/ui';
import DropdownMenuContainer from 'soapbox/containers/dropdown_menu_container';
// import emojify from 'soapbox/features/emoji/emoji';
import PlaceholderChatMessage from 'soapbox/features/placeholder/components/placeholder-chat-message';
import Bundle from 'soapbox/features/ui/components/bundle';
import { MediaGallery } from 'soapbox/features/ui/util/async-components';
import { useAppSelector, useAppDispatch, useOwnAccount } from 'soapbox/hooks';
import { normalizeAccount } from 'soapbox/normalizers';
import { ChatKeys, IChat, IChatMessage, useChatActions, useChatMessages } from 'soapbox/queries/chats';
import { queryClient } from 'soapbox/queries/client';
import { stripHTML } from 'soapbox/utils/html';
import { onlyEmoji } from 'soapbox/utils/rich_content';

import ChatMessageListIntro from './chat-message-list-intro';

import type { Menu } from 'soapbox/components/dropdown_menu';
import type { ChatMessage as ChatMessageEntity } from 'soapbox/types/entities';

const BIG_EMOJI_LIMIT = 1;

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

// const makeEmojiMap = (record: any) => record.get('emojis', ImmutableList()).reduce((map: ImmutableMap<string, any>, emoji: ImmutableMap<string, any>) => {
//   return map.set(`:${emoji.get('shortcode')}:`, emoji);
// }, ImmutableMap());

interface IChatMessageList {
  /** Chat the messages are being rendered from. */
  chat: IChat,
  /** Whether to make the chatbox fill the height of the screen. */
  autosize?: boolean,
}

const START_INDEX = 10000;

/** Scrollable list of chat messages. */
const ChatMessageList: React.FC<IChatMessageList> = ({ chat, autosize }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const account = useOwnAccount();

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

    if (onlyEmoji(c, BIG_EMOJI_LIMIT, false)) {
      c.classList.add('chat-message__bubble--onlyEmoji');
    } else {
      c.classList.remove('chat-message__bubble--onlyEmoji');
    }
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
      <div className='chat-message__media'>
        <Bundle fetchComponent={MediaGallery}>
          {(Component: any) => (
            <Component
              media={ImmutableList([attachment])}
              height={120}
              onOpenMedia={onOpenMedia}
              visible
            />
          )}
        </Bundle>
      </div>
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
    return formatted;
    // const emojiMap = makeEmojiMap(chatMessage);
    // return emojify(formatted, emojiMap.toJS());
  };

  const renderDivider = (key: React.Key, text: string) => <Divider key={key} text={text} textSize='sm' />;

  const handleCopyText = (chatMessage: IChatMessage) => {
    if (navigator.clipboard) {
      const text = stripHTML(chatMessage.content);
      navigator.clipboard.writeText(text);
    }
  };

  const renderMessage = (chatMessage: any) => {
    const isMyMessage = chatMessage.account_id === me;

    const menu: Menu = [];

    if (navigator.clipboard) {
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
      menu.push({
        text: intl.formatMessage(messages.report),
        action: () => dispatch(initReport(normalizeAccount(chat.account) as any, { chatMessage })),
        icon: require('@tabler/icons/flag.svg'),
      });
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
          space={1}
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
                <DropdownMenuContainer
                  items={menu}
                  src={require('@tabler/icons/dots.svg')}
                  title={intl.formatMessage(messages.more)}
                />
              </div>
            )}

            <HStack
              alignItems='center'
              className={classNames({
                'max-w-[85%]': true,
                'order-2': isMyMessage,
                'order-1': !isMyMessage,
              })}
              justifyContent={isMyMessage ? 'end' : 'start'}
            >
              <div
                title={getFormattedTimestamp(chatMessage)}
                className={
                  classNames({
                    'text-ellipsis break-all relative rounded-md p-2 max-w-full': true,
                    'bg-primary-500 text-white mr-2': isMyMessage,
                    'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 order-2 ml-2': !isMyMessage,
                  })
                }
                ref={setBubbleRef}
                tabIndex={0}
              >
                {maybeRenderMedia(chatMessage)}
                <Text size='sm' theme='inherit' dangerouslySetInnerHTML={{ __html: parseContent(chatMessage) }} />
              </div>

              <div className={classNames({ 'order-1': !isMyMessage })}>
                <Avatar src={isMyMessage ? account?.avatar as string : chat.account.avatar as string} size={34} />
              </div>
            </HStack>
          </HStack>

          <HStack
            alignItems='center'
            space={2}
            className={classNames({
              'ml-auto': isMyMessage,
            })}
          >
            <Text
              theme='muted'
              size='xs'
              className={classNames({
                'text-right': isMyMessage,
                'order-2': !isMyMessage,
              })}
            >
              {intl.formatTime(chatMessage.created_at)}
            </Text>

            <div className={classNames({ 'order-1': !isMyMessage })}>
              <div className='w-[34px]' />
            </div>
          </HStack>
        </Stack>
      </div>
    );
  };

  useEffect(() => {
    const lastMessage = formattedChatMessages.pop();
    const lastMessageId = lastMessage?.id;

    if (lastMessageId && !lastMessage.pending) {
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
      <div className='flex-grow flex flex-col justify-end'>
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
    <div className='h-full flex flex-col flex-grow overflow-y-scroll space-y-6'>
      <div className='flex-grow flex flex-col justify-end'>
        <Virtuoso
          ref={node}
          alignToBottom
          firstItemIndex={Math.max(0, firstItemIndex)}
          initialTopMostItemIndex={initialTopMostItemIndex}
          data={cachedChatMessages}
          startReached={handleStartReached}
          followOutput='auto'
          itemContent={(_index, chatMessage) => {
            if (chatMessage.type === 'divider') {
              return renderDivider(_index, chatMessage.text);
            } else {
              return (
                <div className='py-2 px-4'>
                  {renderMessage(chatMessage)}
                </div>
              );
            }
          }}
          components={{
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
