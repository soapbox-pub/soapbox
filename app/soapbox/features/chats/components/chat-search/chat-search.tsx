import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Icon, Input, Stack } from 'soapbox/components/ui';
import { ChatWidgetScreens, useChatContext } from 'soapbox/contexts/chat-context';
import { useDebounce } from 'soapbox/hooks';
import { useChats } from 'soapbox/queries/chats';
import { queryClient } from 'soapbox/queries/client';
import useAccountSearch from 'soapbox/queries/search';
import toast from 'soapbox/toast';

import { ChatKeys } from '../../../../queries/chats';

import Blankslate from './blankslate';
import EmptyResultsBlankslate from './empty-results-blankslate';
import Results from './results';

const messages = defineMessages({
  placeholder: { id: 'chat_search.placeholder', defaultMessage: 'Type a name' },
});

interface IChatSearch {
  isMainPage?: boolean
}

const ChatSearch = (props: IChatSearch) => {
  const intl = useIntl();
  const { isMainPage = false } = props;

  const debounce = useDebounce;
  const history = useHistory();

  const { changeScreen } = useChatContext();
  const { getOrCreateChatByAccountId } = useChats();

  const [value, setValue] = useState<string>('');
  const debouncedValue = debounce(value as string, 300);

  const accountSearchResult = useAccountSearch(debouncedValue);
  const { data: accounts, isFetching } = accountSearchResult;

  const hasSearchValue = debouncedValue && debouncedValue.length > 0;
  const hasSearchResults = (accounts || []).length > 0;

  const handleClickOnSearchResult = useMutation((accountId: string) => {
    return getOrCreateChatByAccountId(accountId);
  }, {
    onError: (error: AxiosError) => {
      const data = error.response?.data as any;
      toast.error(data?.error);
    },
    onSuccess: (response) => {
      if (isMainPage) {
        history.push(`/chats/${response.data.id}`);
      } else {
        changeScreen(ChatWidgetScreens.CHAT, response.data.id);
      }

      queryClient.invalidateQueries(ChatKeys.chatSearch());
    },
  });

  const renderBody = () => {
    if (hasSearchResults) {
      return (
        <Results
          accountSearchResult={accountSearchResult}
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
    <Stack space={4} className='h-full grow'>
      <div className='px-4'>
        <Input
          data-testid='search'
          type='text'
          autoFocus
          placeholder={intl.formatMessage(messages.placeholder)}
          value={value || ''}
          onChange={(event) => setValue(event.target.value)}
          outerClassName='mt-0'
          theme='search'
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

      <Stack className='grow'>
        {renderBody()}
      </Stack>
    </Stack>
  );
};

export default ChatSearch;
