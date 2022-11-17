import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals';
import RelativeTimestamp from 'soapbox/components/relative-timestamp';
import { Avatar, HStack, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification-badge';
import DropdownMenuContainer from 'soapbox/containers/dropdown-menu-container';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch, useAppSelector, useFeatures } from 'soapbox/hooks';
import { IChat, useChatActions } from 'soapbox/queries/chats';

import type { Menu } from 'soapbox/components/dropdown-menu';

const messages = defineMessages({
  blockedYou: { id: 'chat_list_item.blocked_you', defaultMessage: 'This user has blocked you' },
  leaveMessage: { id: 'chat_settings.leave.message', defaultMessage: 'Are you sure you want to leave this chat? Messages will be deleted for you and this chat will be removed from your inbox.' },
  leaveHeading: { id: 'chat_settings.leave.heading', defaultMessage: 'Leave Chat' },
  leaveConfirm: { id: 'chat_settings.leave.confirm', defaultMessage: 'Leave Chat' },
  leaveChat: { id: 'chat_settings.options.leave_chat', defaultMessage: 'Leave Chat' },
});

interface IChatListItemInterface {
  chat: IChat,
  onClick: (chat: any) => void,
}

const ChatListItem: React.FC<IChatListItemInterface> = ({ chat, onClick }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();
  const history = useHistory();

  const { isUsingMainChatPage } = useChatContext();
  const { deleteChat } = useChatActions(chat?.id as string);
  const isBlocked = useAppSelector((state) => state.getIn(['relationships', chat.account.id, 'blocked_by']));

  const menu = useMemo((): Menu => [{
    text: intl.formatMessage(messages.leaveChat),
    action: (event) => {
      event.stopPropagation();

      dispatch(openModal('CONFIRM', {
        heading: intl.formatMessage(messages.leaveHeading),
        message: intl.formatMessage(messages.leaveMessage),
        confirm: intl.formatMessage(messages.leaveConfirm),
        confirmationTheme: 'primary',
        onConfirm: () => {
          deleteChat.mutate(undefined, {
            onSuccess() {
              if (isUsingMainChatPage) {
                history.push('/chats');
              }
            },
          });
        },
      }));
    },
    icon: require('@tabler/icons/logout.svg'),
  }], []);

  return (
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      role='button'
      key={chat.id}
      onClick={() => onClick(chat)}
      className='group px-2 py-3 w-full flex flex-col rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:shadow-inset-ring'
      data-testid='chat-list-item'
    >
      <HStack alignItems='center' justifyContent='between' space={2} className='w-full'>
        <HStack alignItems='center' space={2} className='overflow-hidden'>
          <Avatar src={chat.account?.avatar} size={40} className='flex-none' />

          <Stack alignItems='start' className='overflow-hidden'>
            <div className='flex items-center space-x-1 flex-grow w-full'>
              <Text weight='bold' size='sm' align='left' truncate>{chat.account?.display_name || `@${chat.account.username}`}</Text>
              {chat.account?.verified && <VerificationBadge />}
            </div>

            {isBlocked ? (
              <Text
                align='left'
                size='sm'
                weight='medium'
                theme='muted'
                truncate
                className='w-full h-5 pointer-events-none italic'
                data-testid='chat-last-message'
              >
                {intl.formatMessage(messages.blockedYou)}
              </Text>
            ) : (
              <>
                {chat.last_message?.content && (
                  <Text
                    align='left'
                    size='sm'
                    weight='medium'
                    theme={chat.last_message.unread ? 'default' : 'muted'}
                    truncate
                    className='w-full h-5 truncate-child pointer-events-none'
                    data-testid='chat-last-message'
                    dangerouslySetInnerHTML={{ __html: chat.last_message?.content }}
                  />
                )}
              </>
            )}
          </Stack>
        </HStack>

        <HStack alignItems='center' space={2}>
          {features.chatsDelete && (
            <div className='text-gray-600 hidden group-hover:block hover:text-gray-100'>
              {/* TODO: fix nested buttons here */}
              <DropdownMenuContainer
                items={menu}
                src={require('@tabler/icons/dots.svg')}
                title='Settings'
              />
            </div>
          )}

          {chat.last_message && (
            <>
              {chat.last_message.unread && (
                <div
                  className='w-2 h-2 rounded-full bg-secondary-500'
                  data-testid='chat-unread-indicator'
                />
              )}

              <RelativeTimestamp
                timestamp={chat.last_message.created_at}
                align='right'
                size='xs'
                theme={chat.last_message.unread ? 'default' : 'muted'}
                truncate
              />
            </>
          )}
        </HStack>
      </HStack>
    </div>
  );
};

export default ChatListItem;
