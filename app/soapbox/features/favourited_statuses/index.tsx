import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchAccount, fetchAccountByUsername } from 'soapbox/actions/accounts';
import { fetchFavouritedStatuses, expandFavouritedStatuses, fetchAccountFavouritedStatuses, expandAccountFavouritedStatuses } from 'soapbox/actions/favourites';
import MissingIndicator from 'soapbox/components/missing_indicator';
import StatusList from 'soapbox/components/status_list';
import { Spinner } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { findAccountByUsername } from 'soapbox/selectors';
import { getFeatures } from 'soapbox/utils/features';

import Column from '../ui/components/column';

import type { RootState } from 'soapbox/store';

const messages = defineMessages({
  heading: { id: 'column.favourited_statuses', defaultMessage: 'Liked posts' },
});

const mapStateToProps = (state: RootState, { params }: IFavourites) => {
  const username = params?.username || '';
  const me = state.get('me');
  const meUsername = state.accounts.get(me)?.username || '';

  const isMyAccount = (username.toLowerCase() === meUsername?.toLowerCase());

  const features = getFeatures(state.get('instance'));

  if (isMyAccount) {
    return {
      isMyAccount,
      statusIds: state.status_lists.get('favourites')?.items || ImmutableOrderedSet<string>(),
      isLoading: state.status_lists.get('favourites')?.isLoading === true,
      hasMore: !!state.status_lists.get('favourites')?.next,
      unavailable: false,
      isAccount: true,
    };
  }

  const accountFetchError = ((state.accounts.get(-1)?.username || '').toLowerCase() === username.toLowerCase());

  let accountId: number | string | null = -1;
  if (accountFetchError) {
    accountId = null;
  } else {
    const account = findAccountByUsername(state, username);
    accountId = account?.id || -1;
  }

  const isBlocked = state.relationships.getIn([accountId, 'blocked_by'], false) === true;
  const unavailable = (me === accountId) ? false : (isBlocked && !features.blockersVisible);

  return {
    isMyAccount,
    accountId,
    unavailable,
    username,
    isAccount: !!state.getIn(['accounts', accountId]),
    statusIds: state.status_lists.get(`favourites:${accountId}`)?.items || ImmutableOrderedSet<string>(),
    isLoading: state.status_lists.get(`favourites:${accountId}`)?.isLoading === true,
    hasMore: !!state.status_lists.get(`favourites:${accountId}`)?.next,
  };
};

interface IFavourites {
  params?: {
    username?: string,
  }
}

const Favourites: React.FC<IFavourites> = (props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const username = props.params?.username || '';
  const { statusIds, isLoading, hasMore, isMyAccount, isAccount, accountId, unavailable } = useAppSelector(state => mapStateToProps(state, props));

  useEffect(() => {
    if (isMyAccount)
      dispatch(fetchFavouritedStatuses());
    else {
      if (typeof accountId === 'string') {
        dispatch(fetchAccount(accountId));
        dispatch(fetchAccountFavouritedStatuses(accountId));
      } else {
        dispatch(fetchAccountByUsername(username));
      }
    }
  }, []);

  useEffect(() => {
    if (!isMyAccount && typeof accountId === 'string') {
      dispatch(fetchAccount(accountId));
      dispatch(fetchAccountFavouritedStatuses(accountId));
    }
  }, [accountId]);

  const handleLoadMore = useCallback(debounce(() => {
    if (isMyAccount) {
      dispatch(expandFavouritedStatuses());
    } else if (typeof accountId === 'string') {
      dispatch(expandAccountFavouritedStatuses(accountId));
    }
  }, 300, { leading: true }), [accountId]);

  if (!isMyAccount && !isAccount && accountId !== -1) {
    return (
      <MissingIndicator />
    );
  }

  if (accountId === -1) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  if (unavailable) {
    return (
      <Column>
        <div className='empty-column-indicator'>
          <FormattedMessage id='empty_column.account_unavailable' defaultMessage='Profile unavailable' />
        </div>
      </Column>
    );
  }

  const emptyMessage = isMyAccount
    ? <FormattedMessage id='empty_column.favourited_statuses' defaultMessage="You don't have any liked posts yet. When you like one, it will show up here." />
    : <FormattedMessage id='empty_column.account_favourited_statuses' defaultMessage="This user doesn't have any liked posts yet." />;

  return (
    <Column label={intl.formatMessage(messages.heading)} withHeader={false} transparent>
      <StatusList
        statusIds={statusIds}
        scrollKey='favourited_statuses'
        hasMore={hasMore}
        isLoading={typeof isLoading === 'boolean' ? isLoading : true}
        onLoadMore={handleLoadMore}
        emptyMessage={emptyMessage}
      />
    </Column>
  );
};

export default Favourites;