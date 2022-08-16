import { useMutation } from '@tanstack/react-query';
import classNames from 'clsx';
import {
  Map as ImmutableMap,
  List as ImmutableList,
  OrderedSet as ImmutableOrderedSet,
} from 'immutable';
import escape from 'lodash/escape';
import throttle from 'lodash/throttle';
import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { createSelector } from 'reselect';

import { fetchChatMessages, deleteChatMessage } from 'soapbox/actions/chats';
import { openModal } from 'soapbox/actions/modals';
import { initReportById } from 'soapbox/actions/reports';
import { Avatar, HStack, IconButton, Spinner, Stack, Text } from 'soapbox/components/ui';
import DropdownMenuContainer from 'soapbox/containers/dropdown_menu_container';
import emojify from 'soapbox/features/emoji/emoji';
import PlaceholderChat from 'soapbox/features/placeholder/components/placeholder_chat';
import Bundle from 'soapbox/features/ui/components/bundle';
import { MediaGallery } from 'soapbox/features/ui/util/async-components';
import { useAppSelector, useAppDispatch, useRefEventHandler, useOwnAccount } from 'soapbox/hooks';
import { IChat, IChatMessage, useChat, useChatMessages } from 'soapbox/queries/chats';
import { queryClient } from 'soapbox/queries/client';
import { onlyEmoji } from 'soapbox/utils/rich_content';

import type { Menu } from 'soapbox/components/dropdown_menu';
import type { ChatMessage as ChatMessageEntity } from 'soapbox/types/entities';

const BIG_EMOJI_LIMIT = 1;

const messages = defineMessages({
  today: { id: 'chats.dividers.today', defaultMessage: 'Today' },
  more: { id: 'chats.actions.more', defaultMessage: 'More' },
  delete: { id: 'chats.actions.delete', defaultMessage: 'Delete message' },
  report: { id: 'chats.actions.report', defaultMessage: 'Report user' },
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

const getChatMessages = createSelector(
  [(chatMessages: ImmutableMap<string, ChatMessageEntity>, chatMessageIds: ImmutableOrderedSet<string>) => (
    chatMessageIds.reduce((acc, curr) => {
      const chatMessage = chatMessages.get(curr);
      return chatMessage ? acc.push(chatMessage) : acc;
    }, ImmutableList<ChatMessageEntity>())
  )],
  chatMessages => chatMessages,
);

interface IChatMessageList {
  /** Chat the messages are being rendered from. */
  chat: IChat,
  /** Message IDs to render. */
  chatMessageIds: ImmutableOrderedSet<string>,
  /** Whether to make the chatbox fill the height of the screen. */
  autosize?: boolean,
}

/** Scrollable list of chat messages. */
const ChatMessageList: React.FC<IChatMessageList> = ({ chat, chatMessageIds, autosize }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const account = useOwnAccount();

  const [initialLoad, setInitialLoad] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  const { deleteChatMessage } = useChat(chat.id);
  const { data: chatMessages, isLoading, isFetching, isFetched, fetchNextPage, isFetchingNextPage, isPlaceholderData } = useChatMessages(chat.id);
  const formattedChatMessages = chatMessages || [];

  const me = useAppSelector(state => state.me);


  const node = useRef<HTMLDivElement>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const lastComputedScroll = useRef<number | undefined>(undefined);
  const scrollBottom = useRef<number | undefined>(undefined);

  const initialCount = useMemo(() => formattedChatMessages.length, []);

  const handleDeleteMessage = useMutation((chatMessageId: string) => deleteChatMessage(chatMessageId), {
    onSettled: () => {
      queryClient.invalidateQueries(['chats', 'messages', chat.id]);
    },
  });

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView(false);
  };

  const getFormattedTimestamp = (chatMessage: ChatMessageEntity) => {
    return intl.formatDate(
      new Date(chatMessage.created_at), {
      hour12: false,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    },
    );
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
      console.log('bottom', scrollBottom.current);

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

  const renderDivider = (key: React.Key, text: string) => (
    <div className='relative' key={key}>
      <div className='absolute inset-0 flex items-center' aria-hidden='true'>
        <div className='w-full border-solid border-t border-gray-300' />
      </div>
      <div className='relative flex justify-center'>
        <Text theme='muted' size='xs' className='px-2 bg-white' tag='span'>{text}</Text>
      </div>
    </div>
  );

  const handleReportUser = (userId: string) => {
    return () => {
      dispatch(initReportById(userId));
    };
  };

  const renderMessage = (chatMessage: any) => {
    const isMyMessage = chatMessage.account_id === me;

    const menu: Menu = [
      {
        text: intl.formatMessage(messages.delete),
        action: () => handleDeleteMessage.mutate(chatMessage.id),
        icon: require('@tabler/icons/trash.svg'),
        destructive: true,
      },
    ];

    if (chatMessage.account_id !== me) {
      menu.push({
        text: intl.formatMessage(messages.report),
        action: handleReportUser(chatMessage.account_id),
        icon: require('@tabler/icons/flag.svg'),
      });
    }

    return (
      <div key={chatMessage.id} className='group'>
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
            {isMyMessage ? (
              <div className='hidden group-hover:block mr-2 text-gray-500'>
                <DropdownMenuContainer
                  items={menu}
                  src={require('@tabler/icons/dots.svg')}
                  title={intl.formatMessage(messages.more)}
                />
              </div>
            ) : null}

            <HStack
              alignItems='center'
              className='max-w-[85%]'
              justifyContent={isMyMessage ? 'end' : 'start'}
            >
              <div
                title={getFormattedTimestamp(chatMessage)}
                className={
                  classNames({
                    'text-ellipsis break-words relative rounded-md p-2': true,
                    'bg-primary-500 text-white mr-2': isMyMessage,
                    'bg-gray-200 text-gray-900 order-2 ml-2': !isMyMessage,
                  })
                }
                ref={setBubbleRef}
                tabIndex={0}
              >
                {maybeRenderMedia(chatMessage)}
                <Text size='sm' theme='inherit' dangerouslySetInnerHTML={{ __html: parseContent(chatMessage) }} />
                <div className='chat-message__menu'>
                  <DropdownMenuContainer
                    items={menu}
                    src={require('@tabler/icons/dots.svg')}
                    title={intl.formatMessage(messages.more)}
                  />
                </div>
              </div>

              <div className={classNames({ 'order-1': !isMyMessage })}>
                <Avatar src={isMyMessage ? account?.avatar : chat.account.avatar} size={34} />
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
  useLayoutEffect(() => {
    if (node.current) {
      const { scrollHeight, scrollTop } = node.current;
      scrollBottom.current = scrollHeight - scrollTop;
    }
  });

  // Stick scrollbar to bottom.
  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom();
    }

    // First load.
    // if (chatMessages.count() !== initialCount) {
    //   setInitialLoad(false);
    //   setIsLoading(false);
    //   scrollToBottom();
    // }
  }, [formattedChatMessages.length]);

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messagesEnd.current]);

  // History added.
  const lastChatId = Number(chatMessages && chatMessages[0]?.id);


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

  return (
    <div className='h-full flex flex-col px-4 flex-grow overflow-y-scroll' onScroll={handleScroll} ref={node}> {/* style={{ height: autosize ? 'calc(100vh - 16rem)' : undefined }} */}
      <div className='flex-grow flex flex-col justify-end space-y-4'>
        {isLoading ? (
          <>
            <PlaceholderChat isMyMessage />
            <PlaceholderChat />
            <PlaceholderChat isMyMessage />
            <PlaceholderChat isMyMessage />
            <PlaceholderChat />
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
