import globeIcon from '@tabler/icons/outline/globe.svg';
import trendIcon from '@tabler/icons/outline/trending-up.svg';
import userIcon from '@tabler/icons/outline/user.svg';
import { useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Route, Switch, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom-v5-compat';

import { clearSearch, setFilter } from '@/actions/search.ts';
import { Column } from '@/components/ui/column.tsx';
import Divider from '@/components/ui/divider.tsx';
import Stack from '@/components/ui/stack.tsx';
import Tabs from '@/components/ui/tabs.tsx';
import SearchResults from '@/features/compose/components/search-results.tsx';
import Search from '@/features/compose/components/search.tsx';
import ExploreCards from '@/features/explore/components/explore-cards.tsx';
import ExploreFilter from '@/features/explore/components/exploreFilter.tsx';
import AccountsCarousel from '@/features/explore/components/popular-accounts.tsx';
import { useSearchTokens } from '@/features/explore/useSearchTokens.ts';
import { PublicTimeline } from '@/features/ui/util/async-components.ts';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useFeatures } from '@/hooks/useFeatures.ts';
import { SearchFilter } from '@/reducers/search.ts';

const messages = defineMessages({
  heading: { id: 'column.explore', defaultMessage: 'Explore' },
  accounts: { id: 'search_results.accounts', defaultMessage: 'Accounts' },
  statuses: { id: 'search_results.posts', defaultMessage: 'Posts' },
  trends: { id: 'search_results.trends', defaultMessage: 'Trends' },
  filters: { id: 'column.explore.filters', defaultMessage: 'Filters:' },
});

const PostsTab = () => {
  const intl = useIntl();
  const features = useFeatures();
  const { tokens } = useSearchTokens();
  const { pathname } = useLocation();

  return (
    <Stack space={4}>
      {pathname === '/explore' && (
        <>
          {features.nostr && (
            <>
              <ExploreCards />
              <Divider text={intl.formatMessage(messages.filters)} />
              <ExploreFilter />
              <Divider />
            </>
          )}

          {tokens.size ? <SearchResults /> : <PublicTimeline />}
        </>
      )}

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


const ExplorePage = () => {
  const features = useFeatures();
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const path = useLocation().pathname;

  const selectFilter = (newActiveFilter: SearchFilter) => dispatch(setFilter(newActiveFilter));

  const selectedValue = useMemo(() => {
    if (path === '/explore') return 'posts';
    if (path === '/explore/trends') return 'statuses';
    return 'accounts';
  }, [path]);

  useEffect(() => {
    if (selectedValue === 'accounts') {
      dispatch(setFilter('accounts'));
    }
  }, [selectedValue, dispatch]);

  const [selectedFilter, setSelectedFilter] = useState(selectedValue);

  const renderFilterBar = () => {
    const items = [
      {
        text: intl.formatMessage(messages.statuses),
        action: () =>  handleTabs(''),
        name: 'posts',
        icon: globeIcon,
      },
      ...(features.nostr ? [{
        text: intl.formatMessage(messages.trends),
        action: () => handleTabs('/trends', 'statuses'),
        name: 'statuses',
        icon: trendIcon,
      }] : []),
      {
        text: intl.formatMessage(messages.accounts),
        action: () => handleTabs('/accounts', 'accounts'),
        name: 'accounts',
        icon: userIcon,
      },
    ];

    const handleTabs = (path: string, filter?: SearchFilter) => {
      if (filter) {
        selectFilter(filter);
        dispatch(clearSearch());
      } else {
        selectFilter('statuses');
      }
      setSelectedFilter(filter ?? 'posts');
      navigate(`/explore${path}`);
    };

    return <Tabs items={items} activeItem={selectedFilter} />;
  };

  return (
    <Column label={intl.formatMessage(messages.heading)} withHeader={false} slim>

      <Stack space={2}>

        <div className='relative px-4'>
          {renderFilterBar()}
        </div>

        <Switch>
          <Route exact path='/explore' component={PostsTab} />
          {features.nostr && <Route path='/explore/trends' component={TrendsTab} />}
          <Route path='/explore/accounts' component={AccountsTab} />
        </Switch>

      </Stack>

    </Column>
  );
};

export default ExplorePage;
