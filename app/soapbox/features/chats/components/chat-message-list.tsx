import { useMutation } from '@tanstack/react-query';
import classNames from 'clsx';
import { List as ImmutableList } from 'immutable';
import escape from 'lodash/escape';
import throttle from 'lodash/throttle';
import React, { useState, useEffect, useRef } from 'react';
import { useIntl, defineMessages } from 'react-intl';

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
import { chatKeys, IChat, IChatMessage, useChatActions, useChatMessages } from 'soapbox/queries/chats';
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

/** Scrollable list of chat messages. */
const ChatMessageList: React.FC<IChatMessageList> = ({ chat, autosize }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const account = useOwnAccount();

  const [initialLoad, setInitialLoad] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  const { deleteChatMessage, markChatAsRead } = useChatActions(chat.id);
  const {
    data: chatMessages,
    fetchNextPage,
    isError,
    isFetched,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isPlaceholderData,
    refetch,
  } = useChatMessages(chat.id);
  const formattedChatMessages = chatMessages || [];

  const me = useAppSelector((state) => state.me);
  const isBlocked = useAppSelector((state) => state.getIn(['relationships', chat.account.id, 'blocked_by']));

  const node = useRef<HTMLDivElement>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const lastComputedScroll = useRef<number | undefined>(undefined);
  const scrollBottom = useRef<number | undefined>(undefined);

  const handleDeleteMessage = useMutation((chatMessageId: string) => deleteChatMessage(chatMessageId), {
    onSettled: () => {
      queryClient.invalidateQueries(chatKeys.chatMessages(chat.id));
    },
  });

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView(false);
  };

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

  const isNearBottom = (): boolean => {
    const elem = node.current;
    if (!elem) return false;

    const scrollBottom = elem.scrollHeight - elem.offsetHeight - elem.scrollTop;
    return scrollBottom < elem.offsetHeight * 1.5;
  };

  const restoreScrollPosition = () => {
    if (node.current && scrollBottom.current) {
      lastComputedScroll.current = node.current.scrollHeight - scrollBottom.current;
      node.current.scrollTop = lastComputedScroll.current;
    }
  };

  const handleLoadMore = () => {
    // const maxId = chatMessages.getIn([0, 'id']) as string;
    // dispatch(fetchChatMessages(chat.id, maxId as any));
    // setIsLoading(true);
    if (!isFetching) {
      // setMaxId(formattedChatMessages[0].id);
      fetchNextPage()
        .then(() => {
          if (node.current) {
            setScrollPosition(node.current.scrollHeight - node.current.scrollTop);
          }
        })
        .catch(() => null);
    }
  };

  const handleScroll = throttle(() => {
    if (node.current) {
      const { scrollTop, offsetHeight } = node.current;
      const computedScroll = lastComputedScroll.current === scrollTop;
      const nearTop = scrollTop < offsetHeight;

      setScrollPosition(node.current.scrollHeight - node.current.scrollTop);

      if (nearTop && !isFetching && !initialLoad && !computedScroll) {
        handleLoadMore();
      }
    }
  }, 150, {
    trailing: true,
  });

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
        action: () => null, // TODO: implement once API is available
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
                    'text-ellipsis break-words relative rounded-md p-2 max-w-full': true,
                    'bg-primary-500 text-white mr-2': isMyMessage,
                    'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 order-2 ml-2': !isMyMessage,
                  })
                }
                ref={setBubbleRef}
                tabIndex={0}
              >
                {maybeRenderMedia(chatMessage)}
                <Text size='sm' theme='inherit' dangerouslySetInnerHTML={{ __html: parseContent(chatMessage) }} />
                <div className='chat-message__menu' data-testid='chat-message-menu'>
                  <DropdownMenuContainer
                    items={menu}
                    src={require('@tabler/icons/dots.svg')}
                    title={intl.formatMessage(messages.more)}
                  />
                </div>
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
    if (isFetched) {
      setInitialLoad(false);
      scrollToBottom();
    }
  }, [isFetched]);

  // Store the scroll position.
  // useLayoutEffect(() => {
  //   if (node.current) {
  //     const { scrollHeight, scrollTop } = node.current;
  //     scrollBottom.current = scrollHeight - scrollTop;
  //   }
  // });

  // Stick scrollbar to bottom.
  useEffect(() => {
    if (isNearBottom()) {
      setTimeout(() => {
        scrollToBottom();
      }, 25);
    }

    // First load.
    // if (chatMessages.count() !== initialCount) {
    //   setInitialLoad(false);
    //   setIsLoading(false);
    //   scrollToBottom();
    // }
  }, [formattedChatMessages.length]);

  useEffect(() => {
    const lastMessage = formattedChatMessages.pop();
    const lastMessageId = lastMessage?.id;

    if (lastMessageId && !lastMessage.pending) {
      markChatAsRead(lastMessageId);
    }
  }, [formattedChatMessages.length]);

  useEffect(() => {
    // Restore scroll bar position when loading old messages.
    if (!initialLoad) {
      restoreScrollPosition();
    }
  }, [formattedChatMessages.length, initialLoad]);


  if (isPlaceholderData) {
    return (
      <Stack alignItems='center' justifyContent='center' className='h-full flex-grow'>
        <Spinner withText={false} />
      </Stack>
    );
  }

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

  return (
    <div className='h-full flex flex-col px-4 flex-grow overflow-y-scroll space-y-6' onScroll={handleScroll} ref={node}> {/* style={{ height: autosize ? 'calc(100vh - 16rem)' : undefined }} */}
      {!isLoading ? (
        <ChatMessageListIntro />
      ) : null}

      {isFetchingNextPage ? (
        <div className='flex items-center justify-center'>
          <Spinner size={30} withText={false} />
        </div>
      ) : null}

      <div className='flex-grow flex flex-col justify-end space-y-4'>
        {isLoading ? (
          <>
            <PlaceholderChatMessage isMyMessage />
            <PlaceholderChatMessage />
            <PlaceholderChatMessage isMyMessage />
            <PlaceholderChatMessage isMyMessage />
            <PlaceholderChatMessage />
          </>
        ) : (
          formattedChatMessages.reduce((acc: any, curr: any, idx: number) => {
            const lastMessage = formattedChatMessages[idx - 1];

            if (lastMessage) {
              const key = `${curr.id}_divider`;
              switch (timeChange(lastMessage, curr)) {
                case 'today':
                  acc.push(renderDivider(key, intl.formatMessage(messages.today)));
                  break;
                case 'date':
                  acc.push(renderDivider(key, intl.formatDate(new Date(curr.created_at), { weekday: 'short', hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })));
                  break;
              }
            }

            acc.push(renderMessage(curr));
            return acc;
          }, [] as React.ReactNode[])
        )}
      </div>

      <div className='float-left clear-both mt-4' style={{ float: 'left', clear: 'both' }} ref={messagesEnd} />
    </div>
  );
};

export default ChatMessageList;
