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
import ExploreCards from 'soapbox/features/explore/components/explore-cards.tsx';
import ExploreFilter from 'soapbox/features/explore/components/exploreFilter.tsx';
import AccountsCarousel from 'soapbox/features/explore/components/popular-accounts.tsx';
import { useSearchTokens } from 'soapbox/features/explore/useSearchTokens.ts';
import { PublicTimeline } from 'soapbox/features/ui/util/async-components.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { SearchFilter } from 'soapbox/reducers/search.ts';

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

          {tokens.size ? <PublicTimeline /> : <SearchResults /> }
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
          <Route exact path={'/explore'} component={PostsTab} />
          {features.nostr && <Route path={'/explore/trends'} component={TrendsTab} />}
          <Route path={'/explore/accounts'} component={AccountsTab} />
        </Switch>

      </Stack>

    </Column>
  );
};

export default ExplorePage;
