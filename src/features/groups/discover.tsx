import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { HStack, Icon, IconButton, Input, Stack } from 'soapbox/components/ui';

import PopularGroups from './components/discover/popular-groups';
import PopularTags from './components/discover/popular-tags';
import Search from './components/discover/search/search';
import SuggestedGroups from './components/discover/suggested-groups';
import TabBar, { TabItems } from './components/tab-bar';

const messages = defineMessages({
  placeholder: { id: 'groups.discover.search.placeholder', defaultMessage: 'Search' },
});

const Discover: React.FC = () => {
  const intl = useIntl();

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');

  const hasSearchValue = value && value.length > 0;

  const cancelSearch = () => {
    clearValue();
    setIsSearching(false);
  };

  const clearValue = () => setValue('');

  return (
    <Stack space={4}>
      <TabBar activeTab={TabItems.FIND_GROUPS} />

      <Stack space={6}>
        <HStack alignItems='center'>
          {isSearching ? (
            <IconButton
              src={require('@tabler/icons/arrow-left.svg')}
              iconClassName='mr-2 h-5 w-5 fill-current text-gray-600'
              onClick={cancelSearch}
              data-testid='group-search-icon'
            />
          ) : null}

          <Input
            data-testid='search'
            type='text'
            placeholder={intl.formatMessage(messages.placeholder)}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onFocus={() => setIsSearching(true)}
            outerClassName='mt-0 w-full'
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
        </HStack>

        {isSearching ? (
          <Search
            searchValue={value}
            onSelect={(newValue) => setValue(newValue)}
          />
        ) : (
          <>
            <PopularGroups />
            <SuggestedGroups />
            <PopularTags />
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default Discover;
