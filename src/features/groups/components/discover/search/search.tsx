import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { useGroupSearch } from 'soapbox/api/hooks';
import { Stack } from 'soapbox/components/ui';
import PlaceholderGroupSearch from 'soapbox/features/placeholder/components/placeholder-group-search';
import { useDebounce, useOwnAccount } from 'soapbox/hooks';
import { saveGroupSearch } from 'soapbox/utils/groups';

import Blankslate from './blankslate';
import RecentSearches from './recent-searches';
import Results from './results';

interface Props {
  onSelect(value: string): void
  searchValue: string
}

export default (props: Props) => {
  const { onSelect, searchValue } = props;

  const { account: me } = useOwnAccount();
  const debounce = useDebounce;

  const debouncedValue = debounce(searchValue as string, 300);
  const debouncedValueToSave = debounce(searchValue as string, 1000);

  const groupSearchResult = useGroupSearch(debouncedValue);
  const { groups, isLoading, isFetched, isError } = groupSearchResult;

  const hasSearchResults = isFetched && groups.length > 0;
  const hasNoSearchResults = isFetched && groups.length === 0;

  useEffect(() => {
    if (debouncedValueToSave && debouncedValueToSave.length >= 0) {
      saveGroupSearch(me?.id as string, debouncedValueToSave);
    }
  }, [debouncedValueToSave]);

  if (isLoading) {
    return (
      <Stack space={4}>
        <PlaceholderGroupSearch />
        <PlaceholderGroupSearch />
        <PlaceholderGroupSearch />
      </Stack>
    );
  }

  if (isError) {
    return (
      <Blankslate
        title={
          <FormattedMessage
            id='groups.discover.search.error.title'
            defaultMessage='An error occurred'
          />
        }
        subtitle={
          <FormattedMessage
            id='groups.discover.search.error.subtitle'
            defaultMessage='Please try again later.'
          />
        }
      />
    );
  }

  if (hasNoSearchResults) {
    return (
      <Blankslate
        title={
          <FormattedMessage
            id='groups.discover.search.no_results.title'
            defaultMessage='No matches found'
          />
        }
        subtitle={
          <FormattedMessage
            id='groups.discover.search.no_results.subtitle'
            defaultMessage='Try searching for another group.'
          />
        }
      />
    );
  }

  if (hasSearchResults) {
    return (
      <Results
        groupSearchResult={groupSearchResult}
      />
    );
  }

  return (
    <RecentSearches onSelect={onSelect} />
  );
};