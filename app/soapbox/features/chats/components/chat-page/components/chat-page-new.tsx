import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import AccountSearch from 'soapbox/components/account_search';
import { CardTitle, HStack, Stack, Text } from 'soapbox/components/ui';
import { useChats } from 'soapbox/queries/chats';

import ChatComposer from '../../chat-composer';

interface IChatPageNew {
}

/** New message form to create a chat. */
const ChatPageNew: React.FC<IChatPageNew> = () => {
  const history = useHistory();
  const { getOrCreateChatByAccountId } = useChats();

  const handleAccountSelected = async (accountId: string) => {
    const { data } = await getOrCreateChatByAccountId(accountId);
    history.push(`/chats/${data.id}`);
  };

  return (
    <Stack className='h-full'>
      <Stack className='flex-grow p-6 space-y-8'>
        <CardTitle title='New Message' />

        <HStack space={2} alignItems='center'>
          <Text>
            <FormattedMessage
              id='chats.new.to'
              defaultMessage='To:'
            />
          </Text>

          <AccountSearch
            onSelected={handleAccountSelected}
            theme='transparent'
            showButtons={false}
            autoFocus
          />
        </HStack>
      </Stack>

      <ChatComposer
        value=''
        onSubmit={() => {}}
        disabled
      />
    </Stack>
  );
};

export default ChatPageNew;