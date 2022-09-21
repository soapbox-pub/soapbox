import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import snackbar from 'soapbox/actions/snackbar';
import { HStack, Icon, Input, Stack, Text } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useAppDispatch, useDebounce } from 'soapbox/hooks';
import { useChats } from 'soapbox/queries/chats';
import { queryClient } from 'soapbox/queries/client';
import useAccountSearch from 'soapbox/queries/search';

import ChatPaneHeader from '../chat-pane-header';
import { Pane } from '../ui';

import Blankslate from './blankslate';
import EmptyResultsBlankslate from './empty-results-blankslate';
import Results from './results';

const messages = defineMessages({
  title: { id: 'chat_search.title', defaultMessage: 'Messages' },
});

const ChatSearch = () => {
  const debounce = useDebounce;
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { isOpen, setChat, setSearching, toggleChatPane } = useChatContext();
  const { getOrCreateChatByAccountId } = useChats();

  const [value, setValue] = useState<string>();
  const debouncedValue = debounce(value as string, 300);

  const { data: accounts, isFetching } = useAccountSearch(debouncedValue);

  const hasSearchValue = debouncedValue && debouncedValue.length > 0;
  const hasSearchResults = (accounts || []).length > 0;

  const handleClickOnSearchResult = useMutation((accountId: string) => {
    return getOrCreateChatByAccountId(accountId);
  }, {
    onError: (error: AxiosError) => {
      const data = error.response?.data as any;
      dispatch(snackbar.error(data?.error));
    },
    onSuccess: (response) => {
      setChat(response.data);
      queryClient.invalidateQueries(['chats', 'search']);
    },
  });

  const renderBody = () => {
    if (hasSearchResults) {
      return (
        <Results
          accounts={accounts}
          onSelect={(id) => {
            handleClickOnSearchResult.mutate(id);
            clearValue();
          }}
        />
      );
    } else if (hasSearchValue && !hasSearchResults && !isFetching) {
      return <EmptyResultsBlankslate />;
    } else {
      return <Blankslate />;
    }
  };

  const clearValue = () => {
    if (hasSearchValue) {
      setValue('');
    }
  };

  return (
    <Pane isOpen={isOpen} index={0} main>
      <ChatPaneHeader
        data-testid='pane-header'
        title={
          <HStack alignItems='center' space={2}>
            <button onClick={() => setSearching(false)}>
              <Icon
                src={require('@tabler/icons/arrow-left.svg')}
                className='h-6 w-6 text-gray-600 dark:text-gray-400'
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

      {isOpen ? (
        <Stack space={4} className='flex-grow h-full'>
          <div className='px-4'>
            <Input
              data-testid='search'
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
            {renderBody()}
          </Stack>
        </Stack>
      ) : null}
    </Pane>
  );
};

export default ChatSearch;