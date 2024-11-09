import arrowLeftIcon from '@tabler/icons/outline/arrow-left.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { HStack, Icon, Text } from 'soapbox/components/ui';
import { ChatWidgetScreens, useChatContext } from 'soapbox/contexts/chat-context';

import ChatPaneHeader from '../chat-pane-header';

const messages = defineMessages({
  title: { id: 'chat_search.title', defaultMessage: 'Messages' },
});

const ChatSearchHeader = () => {
  const intl = useIntl();

  const { changeScreen, isOpen, toggleChatPane } = useChatContext();

  return (
    <ChatPaneHeader
      data-testid='pane-header'
      title={
        <HStack alignItems='center' space={2}>
          <button
            onClick={() => {
              changeScreen(ChatWidgetScreens.INBOX);
            }}
          >
            <Icon
              src={arrowLeftIcon}
              className='size-6 text-gray-600 dark:text-gray-400 rtl:rotate-180'
            />
          </button>

          <Text size='sm' weight='bold' truncate>
            {intl.formatMessage(messages.title)}
          </Text>
        </HStack>
      }
      isOpen={isOpen}
      isToggleable={false}
      onToggle={toggleChatPane}
    />
  );
};

export default ChatSearchHeader;