import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Virtuoso } from 'react-virtuoso';

import { HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import { useOwnAccount } from 'soapbox/hooks';
import { groupSearchHistory } from 'soapbox/settings';
import { clearRecentGroupSearches } from 'soapbox/utils/groups';

interface Props {
  onSelect(value: string): void
}

export default (props: Props) => {
  const { onSelect } = props;

  const { account: me } = useOwnAccount();

  const [recentSearches, setRecentSearches] = useState<string[]>(groupSearchHistory.get(me?.id as string) || []);

  const onClearRecentSearches = () => {
    clearRecentGroupSearches(me?.id as string);
    setRecentSearches([]);
  };

  return (
    <Stack space={2} data-testid='recent-searches'>
      {recentSearches.length > 0 ? (
        <>
          <HStack
            alignItems='center'
            justifyContent='between'
            className='bg-white dark:bg-gray-900'
          >
            <Text theme='muted' weight='semibold' size='sm'>
              <FormattedMessage
                id='groups.discover.search.recent_searches.title'
                defaultMessage='Recent searches'
              />
            </Text>

            <button onClick={onClearRecentSearches} data-testid='clear-recent-searches'>
              <Text theme='primary' size='sm' className='hover:underline'>
                <FormattedMessage
                  id='groups.discover.search.recent_searches.clear_all'
                  defaultMessage='Clear all'
                />
              </Text>
            </button>
          </HStack>

          <Virtuoso
            useWindowScroll
            data={recentSearches}
            itemContent={(_index, recentSearch) => (
              <div key={recentSearch} data-testid='recent-search'>
                <button
                  onClick={() => onSelect(recentSearch)}
                  className='group flex w-full flex-col rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800'
                  data-testid='recent-search-result'
                >
                  <HStack alignItems='center' space={2}>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 p-2 dark:bg-gray-800 dark:group-hover:bg-gray-700/20'>
                      <Icon
                        src={require('@tabler/icons/search.svg')}
                        className='h-5 w-5 text-gray-600'
                      />
                    </div>

                    <Text weight='bold' size='sm' align='left'>{recentSearch}</Text>
                  </HStack>
                </button>
              </div>
            )}
          />
        </>
      ) : (
        <Stack space={2} data-testid='recent-searches-blankslate'>
          <Text weight='bold' size='lg'>
            <FormattedMessage id='groups.discover.search.recent_searches.blankslate.title' defaultMessage='No recent searches' />
          </Text>

          <Text theme='muted'>
            <FormattedMessage id='groups.discover.search.recent_searches.blankslate.subtitle' defaultMessage='Search group names, topics or keywords' />
          </Text>
        </Stack>
      )}
    </Stack>
  );
};