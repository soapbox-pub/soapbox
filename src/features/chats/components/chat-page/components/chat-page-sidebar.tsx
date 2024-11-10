import editIcon from '@tabler/icons/outline/edit.svg';
import settingsIcon from '@tabler/icons/outline/settings.svg';
import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { CardTitle } from 'soapbox/components/ui/card.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { useDebounce, useFeatures } from 'soapbox/hooks/index.ts';
import { IChat } from 'soapbox/queries/chats.ts';

import ChatList from '../../chat-list.tsx';
import ChatSearchInput from '../../chat-search-input.tsx';

const messages = defineMessages({
  title: { id: 'column.chats', defaultMessage: 'Chats' },
});

const ChatPageSidebar = () => {
  const intl = useIntl();
  const history = useHistory();
  const features = useFeatures();

  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  const handleClickChat = (chat: IChat) => {
    history.push(`/chats/${chat.id}`);
  };

  const handleChatCreate = () => {
    history.push('/chats/new');
  };

  const handleSettingsClick = () => {
    history.push('/chats/settings');
  };

  return (
    <Stack space={4} className='h-full'>
      <Stack space={4} className='px-4 pt-6'>
        <HStack alignItems='center' justifyContent='between'>
          <CardTitle title={intl.formatMessage(messages.title)} />

          <HStack space={1}>
            <IconButton
              src={settingsIcon}
              iconClassName='h-5 w-5 text-gray-600'
              onClick={handleSettingsClick}
            />

            <IconButton
              src={editIcon}
              iconClassName='h-5 w-5 text-gray-600'
              onClick={handleChatCreate}
            />
          </HStack>
        </HStack>

        {features.chatsSearch && (
          <ChatSearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
        )}
      </Stack>

      <Stack className='h-full grow'>
        <ChatList
          onClickChat={handleClickChat}
          searchValue={debouncedSearch}
        />
      </Stack>
    </Stack>
  );
};

export default ChatPageSidebar;