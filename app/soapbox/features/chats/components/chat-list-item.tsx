import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import RelativeTimestamp from 'soapbox/components/relative-timestamp';
import { Avatar, HStack, Icon, IconButton, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification_badge';
import DropdownMenuContainer from 'soapbox/containers/dropdown_menu_container';
import { useAppDispatch } from 'soapbox/hooks';
import { IChat, IChatSilence, useChat, useChatSilence, useChatSilences } from 'soapbox/queries/chats';

import type { Menu } from 'soapbox/components/dropdown_menu';

const messages = defineMessages({
  leaveMessage: { id: 'chat_settings.leave.message', defaultMessage: 'Are you sure you want to leave this chat? This conversation will be removed from your inbox.' },
  leaveHeading: { id: 'chat_settings.leave.heading', defaultMessage: 'Leave Chat' },
  leaveConfirm: { id: 'chat_settings.leave.confirm', defaultMessage: 'Leave Chat' },
  leaveChat: { id: 'chat_settings.options.leave_chat', defaultMessage: 'Leave Chat' },
});

interface IChatListItemInterface {
  chat: IChat,
  onClick: (chat: any) => void,
  chatSilence?: IChatSilence
}

const ChatListItem: React.FC<IChatListItemInterface> = ({ chat, chatSilence, onClick }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { handleSilence } = useChatSilence(chat);
  const { deleteChat } = useChat(chat?.id as string);

  const menu = useMemo((): Menu => {
    const menu: Menu = [];

    if (chatSilence) {
      menu.push({
        text: 'Unsilence notifications',
        action: (event) => {
          event.stopPropagation();
          handleSilence();
        },
        icon: require('@tabler/icons/bell.svg'),
      });
    } else {
      menu.push({
        text: 'Silence notifications',
        action: (event) => {
          event.stopPropagation();
          handleSilence();
        },
        icon: require('@tabler/icons/bell-off.svg'),
      });
    }

    menu.push({
      text: intl.formatMessage(messages.leaveChat),
      action: (event) => {
        event.stopPropagation();

        dispatch(openModal('CONFIRM', {
          heading: intl.formatMessage(messages.leaveHeading),
          message: intl.formatMessage(messages.leaveMessage),
          confirm: intl.formatMessage(messages.leaveConfirm),
          confirmationTheme: 'primary',
          onConfirm: () => deleteChat.mutate(),
        }));
      },
      icon: require('@tabler/icons/logout.svg'),
    });

    return menu;
  }, [chatSilence]);

  return (
    <button
      key={chat.id}
      type='button'
      onClick={() => onClick(chat)}
      className='group px-2 py-3 w-full flex flex-col rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:shadow-inset-ring'
      data-testid='chat'
    >
      <HStack alignItems='center' justifyContent='between' space={2} className='w-full'>
        <HStack alignItems='center' space={2} className='overflow-hidden'>
          <Avatar src={chat.account?.avatar} size={40} className='flex-none' />

          <Stack alignItems='start' className='overflow-hidden'>
            <div className='flex items-center space-x-1 flex-grow w-full'>
              <Text weight='bold' size='sm' align='left' truncate>{chat.account?.display_name || `@${chat.account.username}`}</Text>
              {chat.account?.verified && <VerificationBadge />}
            </div>

            {chat.last_message?.content && (
              <Text
                align='left'
                size='sm'
                weight='medium'
                theme='muted'
                truncate
                className='w-full truncate-child pointer-events-none'
                data-testid='chat-last-message'
                dangerouslySetInnerHTML={{ __html: chat.last_message?.content }}
              />
            )}
          </Stack>
        </HStack>

        <HStack alignItems='center' space={2}>
          <div className='text-gray-600 hidden group-hover:block hover:text-gray-100'>
            <DropdownMenuContainer
              items={menu}
              src={require('@tabler/icons/dots.svg')}
              title='Settings'
            />
          </div>


          {chatSilence ? (
            <Icon src={require('@tabler/icons/bell-off.svg')} className='w-5 h-5 text-gray-600' />
          ) : null}

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
                truncate
              />
            </>
          )}
        </HStack>
      </HStack>
    </button>
  );
};

export default ChatListItem;
