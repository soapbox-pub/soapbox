import React from 'react';
import { useHistory } from 'react-router-dom';

import AccountSearch from 'soapbox/components/account_search';
import { CardTitle, Stack } from 'soapbox/components/ui';
import { useChats } from 'soapbox/queries/chats';

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
    <Stack className='h-full p-6 space-y-8'>
      <CardTitle title='New Message' />

      <AccountSearch
        onSelected={handleAccountSelected}
      />
    </Stack>
  );
};

export default ChatPageNew;