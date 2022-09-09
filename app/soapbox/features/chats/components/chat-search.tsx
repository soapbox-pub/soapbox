import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useState } from 'react';

import snackbar from 'soapbox/actions/snackbar';
import { Avatar, HStack, Icon, Input, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification_badge';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch, useDebounce } from 'soapbox/hooks';
import { useChats } from 'soapbox/queries/chats';
import { queryClient } from 'soapbox/queries/client';
import useAccountSearch from 'soapbox/queries/search';

import ChatPaneHeader from './chat-pane-header';
import { Pane } from './ui';

const ChatSearch = () => {
  const debounce = useDebounce;
  const dispatch = useAppDispatch();

  const { isOpen, setChat, setSearching, toggleChatPane } = useChatContext();
  const { getOrCreateChatByAccountId } = useChats();

  const [value, setValue] = useState<string>();
  const debouncedValue = debounce(value as string, 300);

  const { data: accounts } = useAccountSearch(debouncedValue);

  const hasSearchValue = value && value.length > 0;

  const handleClickOnSearchResult = useMutation((accountId: string) => {
    return getOrCreateChatByAccountId(accountId);
  }, {
    onError: (error: AxiosError) => {
      const data = error.response?.data as any;
      dispatch(snackbar.error(data?.error));
    },
    onSuccess: (response) => {
      setChat(response.data);
      queryClient.invalidateQueries(['chats']);
    },
  });

  const clearValue = () => {
    if (hasSearchValue) {
      setValue('');
    }
  };

  return (
    <Pane isOpen={isOpen} index={0} main>
      <ChatPaneHeader
        title={
          <HStack alignItems='center' space={2}>
            <button onClick={() => setSearching(false)}>
              <Icon
                src={require('@tabler/icons/arrow-left.svg')}
                className='h-6 w-6 text-gray-600 dark:text-gray-400'
              />
            </button>

            <Text size='sm' weight='bold' truncate>Messages</Text>
          </HStack>
        }
        isOpen={isOpen}
        isToggleable={false}
        onToggle={toggleChatPane}
      />

      {isOpen ? (
        <Stack space={4} className='flex-grow h-full'>
          <div className='px-4'>
            <Input
              type='text'
              autoFocus
              placeholder='Type a name'
              className='rounded-full'
              value={value || ''}
              onChange={(event) => setValue(event.target.value)}
              isSearch
              append={
                <button onClick={clearValue}>
                  <Icon
                    src={hasSearchValue ? require('@tabler/icons/x.svg') : require('@tabler/icons/search.svg')}
                    className='h-4 w-4 text-gray-700 dark:text-gray-600'
                    aria-hidden='true'
                  />
                </button>
              }
            />
          </div>

          <Stack className='overflow-y-scroll flex-grow h-full' space={2}>
            {(accounts || []).map((account: any) => (
              <button
                key={account.id}
                type='button'
                className='px-4 py-2 w-full flex flex-col hover:bg-gray-100 dark:hover:bg-gray-800'
                onClick={() => {
                  handleClickOnSearchResult.mutate(account.id);
                  clearValue();
                }}
              >
                <HStack alignItems='center' space={2}>
                  <Avatar src={account.avatar} size={40} />

                  <Stack alignItems='start'>
                    <div className='flex items-center space-x-1 flex-grow'>
                      <Text weight='bold' size='sm' truncate>{account.display_name}</Text>
                      {account.verified && <VerificationBadge />}
                    </div>
                    <Text size='sm' weight='medium' theme='muted' truncate>@{account.acct}</Text>
                  </Stack>
                </HStack>
              </button>
            ))}
          </Stack>
        </Stack>
      ) : null}
    </Pane>
  );
};

export default ChatSearch;