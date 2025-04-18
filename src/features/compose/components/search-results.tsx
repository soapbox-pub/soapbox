import xIcon from '@tabler/icons/outline/x.svg';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import {
  FormattedMessage,
} from 'react-intl';

import {
  expandSearch,
  setSearchAccount,
} from 'soapbox/actions/search.ts';
import { expandTrendingStatuses, fetchTrendingStatuses } from 'soapbox/actions/trending-statuses.ts';
import { useAccount } from 'soapbox/api/hooks/index.ts';
import Hashtag from 'soapbox/components/hashtag.tsx';
import IconButton from 'soapbox/components/icon-button.tsx';
import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import AccountContainer from 'soapbox/containers/account-container.tsx';
import StatusContainer from 'soapbox/containers/status-container.tsx';
import PlaceholderAccount from 'soapbox/features/placeholder/components/placeholder-account.tsx';
import PlaceholderHashtag from 'soapbox/features/placeholder/components/placeholder-hashtag.tsx';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder-status.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useSuggestions } from 'soapbox/queries/suggestions.ts';

import type { OrderedSet as ImmutableOrderedSet } from 'immutable';
import type { VirtuosoHandle } from 'react-virtuoso';

const SearchResults = () => {
  const node = useRef<VirtuosoHandle>(null);

  const dispatch = useAppDispatch();

  const { data: suggestions } = useSuggestions();

  const value = useAppSelector((state) => state.search.submittedValue);
  const results = useAppSelector((state) => state.search.results);
  const trendingStatuses = useAppSelector((state) => state.trending_statuses.items);
  const nextTrendingStatuses = useAppSelector((state) => state.trending_statuses.next);
  const trends = useAppSelector((state) => state.trends.items);
  const submitted = useAppSelector((state) => state.search.submitted);
  const selectedFilter = useAppSelector((state) => state.search.filter);
  const filterByAccount = useAppSelector((state) => state.search.accountId || undefined);
  const { account } = useAccount(filterByAccount);

  const handleLoadMore = () => {
    if (results.accounts.size || results.statuses.size || results.hashtags.size) {
      dispatch(expandSearch(selectedFilter));
    } else if (nextTrendingStatuses) {
      dispatch(expandTrendingStatuses(nextTrendingStatuses));
    }
  };

  const handleUnsetAccount = () => dispatch(setSearchAccount(null));

  const getCurrentIndex = (id: string): number => {
    return resultsIds?.keySeq().findIndex(key => key === id);
  };

  const handleMoveUp = (id: string) => {
    if (!resultsIds) return;

    const elementIndex = getCurrentIndex(id) - 1;
    selectChild(elementIndex);
  };

  const handleMoveDown = (id: string) => {
    if (!resultsIds) return;

    const elementIndex = getCurrentIndex(id) + 1;
    selectChild(elementIndex);
  };

  const selectChild = (index: number) => {
    node.current?.scrollIntoView({
      index,
      behavior: 'smooth',
      done: () => {
        const element = document.querySelector<HTMLDivElement>(`#search-results [data-index="${index}"] .focusable`);
        element?.focus();
      },
    });
  };

  useEffect(() => {
    dispatch(fetchTrendingStatuses());
  }, []);

  let searchResults;
  let hasMore = false;
  let loaded;
  let noResultsMessage;
  let placeholderComponent = PlaceholderStatus as React.ComponentType;
  let resultsIds: ImmutableOrderedSet<string>;

  if (selectedFilter === 'accounts') {
    hasMore = results.accountsHasMore;
    loaded = results.accountsLoaded;
    placeholderComponent = PlaceholderAccount;

    if (results.accounts && results.accounts.size > 0) {
      searchResults = results.accounts.map(accountId => <AccountContainer key={accountId} id={accountId} />);
    } else if (!submitted && suggestions.length) {
      searchResults = suggestions.map(suggestion => <AccountContainer key={suggestion.account} id={suggestion.account} />);
    } else if (loaded) {
      noResultsMessage = (
        <div className='flex min-h-[160px] flex-1 items-center justify-center rounded-lg bg-primary-50 p-10 text-center text-gray-900 dark:bg-gray-700 dark:text-gray-300'>
          <FormattedMessage
            id='empty_column.search.accounts'
            defaultMessage='There are no people results for "{term}"'
            values={{ term: value }}
          />
        </div>
      );
    }
  }

  if (selectedFilter === 'statuses') {
    hasMore = results.statusesHasMore;
    loaded = results.statusesLoaded;

    if (results.statuses && results.statuses.size > 0) {
      searchResults = results.statuses.map((statusId: string) => (
        <StatusContainer
          key={statusId}
          id={statusId}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ));
      resultsIds = results.statuses;
    } else if (!submitted && trendingStatuses && !trendingStatuses.isEmpty()) {
      hasMore = !!nextTrendingStatuses;
      searchResults = trendingStatuses.map((statusId: string) => (
        // @ts-ignore
        <StatusContainer
          key={statusId}
          id={statusId}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ));
      resultsIds = trendingStatuses;
    } else if (loaded) {
      noResultsMessage = (
        <div className='flex min-h-[160px] flex-1 items-center justify-center rounded-lg bg-primary-50 p-10 text-center text-gray-900 dark:bg-gray-700 dark:text-gray-300'>
          <FormattedMessage
            id='empty_column.search.statuses'
            defaultMessage='There are no posts results for "{term}"'
            values={{ term: value }}
          />
        </div>
      );
    } else {
      noResultsMessage = <Spinner />;
    }
  }

  if (selectedFilter === 'hashtags') {
    hasMore = results.hashtagsHasMore;
    loaded = results.hashtagsLoaded;
    placeholderComponent = PlaceholderHashtag;

    if (results.hashtags && results.hashtags.size > 0) {
      searchResults = results.hashtags.map(hashtag => <Hashtag key={hashtag.name} hashtag={hashtag} />);
    } else if (!submitted && !trends.isEmpty()) {
      searchResults = trends.map(hashtag => <Hashtag key={hashtag.name} hashtag={hashtag} />);
    } else if (loaded) {
      noResultsMessage = (
        <div className='flex min-h-[160px] flex-1 items-center justify-center rounded-lg bg-primary-50 p-10 text-center text-gray-900 dark:bg-gray-700 dark:text-gray-300'>
          <FormattedMessage
            id='empty_column.search.hashtags'
            defaultMessage='There are no hashtags results for "{term}"'
            values={{ term: value }}
          />
        </div>
      );
    }
  }

  return (
    <>
      {filterByAccount && (
        <HStack className='mb-4 border-b border-solid border-gray-200 px-2 pb-4 dark:border-gray-800' space={2}>
          <IconButton iconClassName='h-5 w-5' src={xIcon} onClick={handleUnsetAccount} />
          <Text truncate>
            <FormattedMessage
              id='search_results.filter_message'
              defaultMessage='You are searching for posts from @{acct}.'
              values={{ acct: <strong className='break-words'>{account?.acct}</strong> }}
            />
          </Text>
        </HStack>
      )}

      {noResultsMessage || (
        <ScrollableList
          id='search-results'
          ref={node}
          key={selectedFilter}
          scrollKey={`${selectedFilter}:${value}`}
          isLoading={submitted && !loaded}
          showLoading={submitted && !loaded && (Array.isArray(searchResults) ? !searchResults.length : searchResults?.isEmpty())}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          placeholderComponent={placeholderComponent}
          placeholderCount={20}
          listClassName={clsx({
            'divide-gray-200 dark:divide-gray-800 divide-solid divide-y': selectedFilter === 'statuses',
          })}
          itemClassName={clsx({
            'px-4': selectedFilter !== 'statuses',
            'pb-4': selectedFilter === 'accounts',
            'pb-3': selectedFilter === 'hashtags',
          })}
        >
          {searchResults || []}
        </ScrollableList>
      )}
    </>
  );
};

export default SearchResults;
