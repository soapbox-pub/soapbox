import globeIcon from '@tabler/icons/outline/globe.svg';
import trendIcon from '@tabler/icons/outline/trending-up.svg';
import userIcon from '@tabler/icons/outline/user.svg';
import { useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Route, Switch, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom-v5-compat';

import { clearSearch, setFilter } from 'soapbox/actions/search.ts';
import { Column } from 'soapbox/components/ui/column.tsx';
import Divider from 'soapbox/components/ui/divider.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Tabs from 'soapbox/components/ui/tabs.tsx';
import SearchResults from 'soapbox/features/compose/components/search-results.tsx';
import Search from 'soapbox/features/compose/components/search.tsx';
import ExplorerCards from 'soapbox/features/explorer/components/explorer-cards.tsx';
import ExplorerFilter from 'soapbox/features/explorer/components/explorerFilter.tsx';
import AccountsCarousel from 'soapbox/features/explorer/components/popular-accounts.tsx';
import { PublicTimeline } from 'soapbox/features/ui/util/async-components.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { IFilters, initialState as filterInitialState } from 'soapbox/reducers/search-filter.ts';
import { SearchFilter } from 'soapbox/reducers/search.ts';

const messages = defineMessages({
  heading: { id: 'column.explorer', defaultMessage: 'Explorer' },
  accounts: { id: 'search_results.accounts', defaultMessage: 'Accounts' },
  statuses: { id: 'search_results.posts', defaultMessage: 'Posts' },
  trends: { id: 'search_results.trends', defaultMessage: 'Trends' },
  filters: { id: 'column.explorer.filters', defaultMessage: 'Filters:' },
});

const checkFilters = (filters: IFilters[]) => {
  return filters.length !== filterInitialState.length ||
    !filters.every((filter, index) =>
      filter.name === filterInitialState[index].name &&
      filter.status === filterInitialState[index].status &&
      filter.value === filterInitialState[index].value,
    );
};

const PostsTab = () => {
  const path = useLocation().pathname;
  const intl = useIntl();
  const inPosts = path === '/explorer';
  const filters = useAppSelector((state) => state.search_filter);

  const [withFilter, setWithFilter] = useState(checkFilters(filters));

  useEffect(() => {
    setWithFilter(checkFilters(filters));
  }, [filters]);

  return (
    <Stack space={4}>
      {inPosts && <>

        <ExplorerCards />

        <Divider text={intl.formatMessage(messages.filters)} />

        <ExplorerFilter />

        <Divider />

        {!withFilter ? <PublicTimeline /> : <SearchResults /> }
      </>
      }

    </Stack>
  );
};

const TrendsTab = () => {
  return (
    <Stack>
      <SearchResults />
    </Stack>
  );
};

const AccountsTab = () => {
  return (
    <Stack space={4} className='pt-1'>
      <AccountsCarousel />

      <Divider />

      <Stack space={3}>
        <div className='px-4'>
          <Search autoSubmit />
        </div>

        <SearchResults />
      </Stack>
    </Stack>
  );
};


const SearchPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const path = useLocation().pathname;

  const selectFilter = (newActiveFilter: SearchFilter) => dispatch(setFilter(newActiveFilter));

  const selectedValue = useMemo(() => {
    if (path === '/explorer') return 'posts';
    if (path === '/explorer/trends') return 'statuses';
    return 'accounts';
  }, [path]);

  useEffect(() => {
    if (selectedValue === 'accounts') {
      dispatch(setFilter('accounts'));
    }
  }, [selectedValue, dispatch]);

  const [selectedFilter, setSelectedFilter] = useState(selectedValue);

  const renderFilterBar = () => {
    const items = [];

    const handleTabs = (path: string, filter?: SearchFilter) => {
      if (filter) {
        selectFilter(filter);
        dispatch(clearSearch());
      } else {
        selectFilter('statuses');
      }
      setSelectedFilter(filter ?? 'posts');
      navigate(`/explorer${path}`);
    };

    items.push(
      {
        text: intl.formatMessage(messages.statuses),
        action: () =>  handleTabs(''),
        name: 'posts',
        icon: globeIcon,
      },
      {
        text: intl.formatMessage(messages.trends),
        action: () => handleTabs('/trends', 'statuses'),
        name: 'statuses',
        icon: trendIcon,
      },
      {
        text: intl.formatMessage(messages.accounts),
        action: () => handleTabs('/accounts', 'accounts'),
        name: 'accounts',
        icon: userIcon,
      },
    );

    return <Tabs items={items} activeItem={selectedFilter} />;
  };

  return (
    <Column label={intl.formatMessage(messages.heading)} withHeader={false} slim>

      <Stack space={2}>

        <div className='relative px-4'>
          {renderFilterBar()}
        </div>

        <Switch>
          <Route exact path={'/explorer'} component={PostsTab} />
          <Route path={'/explorer/trends'} component={TrendsTab} />
          <Route path={'/explorer/accounts'} component={AccountsTab} />
        </Switch>

      </Stack>

    </Column>
  );
};

export default SearchPage;
