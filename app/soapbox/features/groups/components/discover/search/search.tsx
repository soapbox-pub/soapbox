import React, { useEffect } from 'react';

import { Stack } from 'soapbox/components/ui';
import PlaceholderGroupSearch from 'soapbox/features/placeholder/components/placeholder-group-search';
import { useDebounce, useOwnAccount } from 'soapbox/hooks';
import { useGroupSearch } from 'soapbox/queries/groups/search';
import { saveGroupSearch } from 'soapbox/utils/groups';

import NoResultsBlankslate from './no-results-blankslate';
import RecentSearches from './recent-searches';
import Results from './results';

interface Props {
  onSelect(value: string): void
  searchValue: string
}

export default (props: Props) => {
  const { onSelect, searchValue } = props;

  const me = useOwnAccount();
  const debounce = useDebounce;

  const debouncedValue = debounce(searchValue as string, 300);
  const debouncedValueToSave = debounce(searchValue as string, 1000);

  const groupSearchResult = useGroupSearch(debouncedValue);
  const { groups, isFetching, isFetched } = groupSearchResult;

  const hasSearchResults = isFetched && groups.length > 0;
  const hasNoSearchResults = isFetched && groups.length === 0;

  useEffect(() => {
    if (debouncedValueToSave && debouncedValueToSave.length >= 0) {
      saveGroupSearch(me?.id as string, debouncedValueToSave);
    }
  }, [debouncedValueToSave]);

  if (isFetching) {
    return (
      <Stack space={4}>
        <PlaceholderGroupSearch />
        <PlaceholderGroupSearch />
        <PlaceholderGroupSearch />
      </Stack>
    );
  }

  if (hasNoSearchResults) {
    return <NoResultsBlankslate />;
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