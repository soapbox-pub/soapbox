import React, { useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { Avatar, HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification_badge';
import { ChatWidgetScreens, useChatContext } from 'soapbox/contexts/chat-context';
import { secondsToDays } from 'soapbox/utils/numbers';

import Chat from '../chat';

import ChatPaneHeader from './chat-pane-header';
import ChatSettings from './chat-settings';

const messages = defineMessages({
  autoDeleteMessage: { id: 'chat_window.auto_delete_label', defaultMessage: 'Auto-delete after {day} days' },
});

const LinkWrapper = ({ enabled, to, children }: { enabled: boolean, to: string, children: React.ReactNode }): JSX.Element => {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Link to={to}>
      {children}
    </Link>
  );
};

/** Floating desktop chat window. */
const ChatWindow = () => {
  const intl = useIntl();

  const { chat, currentChatId, screen, changeScreen, isOpen, needsAcceptance, toggleChatPane } = useChatContext();

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const closeChat = () => {
    changeScreen(ChatWidgetScreens.INBOX);
  };

  const openSearch = () => {
    toggleChatPane();
    changeScreen(ChatWidgetScreens.SEARCH);
  };

  const openChatSettings = () => {
    changeScreen(ChatWidgetScreens.CHAT_SETTINGS, currentChatId);
  };

  const secondaryAction = () => {
    if (needsAcceptance) {
      return undefined;
    }

    return isOpen ? openChatSettings : openSearch;
  };

  if (!chat) return null;

  if (screen === ChatWidgetScreens.CHAT_SETTINGS) {
    return <ChatSettings />;
  }

  return (
    <>
      <ChatPaneHeader
        title={
          <HStack alignItems='center' space={2}>
            {isOpen && (
              <button onClick={closeChat}>
                <Icon
                  src={require('@tabler/icons/arrow-left.svg')}
                  className='h-6 w-6 text-gray-600 dark:text-gray-400'
                />
              </button>
            )}

            <HStack alignItems='center' space={3}>
              {isOpen && (
                <Link to={`/@${chat.account.acct}`}>
                  <Avatar src={chat.account.avatar} size={40} />
                </Link>
              )}

              <LinkWrapper enabled={isOpen} to={`/@${chat.account.acct}`}>
                <Stack alignItems='start'>
                  <div className='flex items-center space-x-1 flex-grow'>
                    <Text size='sm' weight='bold' truncate>{chat.account.display_name || `@${chat.account.acct}`}</Text>
                    {chat.account.verified && <VerificationBadge />}
                  </div>
                  {chat.message_expiration && (
                    <Text size='sm' weight='medium' theme='primary' truncate>
                      {intl.formatMessage(messages.autoDeleteMessage, { day: secondsToDays(chat.message_expiration) })}
                    </Text>
                  )}
                </Stack>
              </LinkWrapper>
            </HStack>
          </HStack>
        }
        secondaryAction={secondaryAction()}
        secondaryActionIcon={isOpen ? require('@tabler/icons/info-circle.svg') : require('@tabler/icons/edit.svg')}
        isToggleable={!isOpen}
        isOpen={isOpen}
        onToggle={toggleChatPane}
      />

      <Stack className='overflow-hidden flex-grow h-full' space={2}>
        <Chat chat={chat} inputRef={inputRef} />
      </Stack>
    </>
  );
};

export default ChatWindow;
