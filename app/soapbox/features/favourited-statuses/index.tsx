import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchAccount, fetchAccountByUsername } from 'soapbox/actions/accounts';
import { fetchFavouritedStatuses, expandFavouritedStatuses, fetchAccountFavouritedStatuses, expandAccountFavouritedStatuses } from 'soapbox/actions/favourites';
import MissingIndicator from 'soapbox/components/missing-indicator';
import StatusList from 'soapbox/components/status-list';
import { Column } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useFeatures, useOwnAccount } from 'soapbox/hooks';
import { findAccountByUsername } from 'soapbox/selectors';

const messages = defineMessages({
  heading: { id: 'column.favourited_statuses', defaultMessage: 'Liked posts' },
});

interface IFavourites {
  params?: {
    username?: string
  }
}

/** Timeline displaying a user's favourited statuses. */
const Favourites: React.FC<IFavourites> = (props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const ownAccount = useOwnAccount();

  const username = props.params?.username || '';
  const account = useAppSelector(state => findAccountByUsername(state, username));
  const isOwnAccount = username.toLowerCase() === ownAccount?.username?.toLowerCase();

  const timelineKey = isOwnAccount ? 'favourites' : `favourites:${account?.id}`;
  const statusIds = useAppSelector(state => state.status_lists.get(timelineKey)?.items || ImmutableOrderedSet<string>());
  const isLoading = useAppSelector(state => state.status_lists.get(timelineKey)?.isLoading === true);
  const hasMore = useAppSelector(state => !!state.status_lists.get(timelineKey)?.next);

  const isUnavailable = useAppSelector(state => {
    const blockedBy = state.relationships.getIn([account?.id, 'blocked_by']) === true;
    return isOwnAccount ? false : (blockedBy && !features.blockersVisible);
  });

  const handleLoadMore = useCallback(debounce(() => {
    if (isOwnAccount) {
      dispatch(expandFavouritedStatuses());
    } else if (account) {
      dispatch(expandAccountFavouritedStatuses(account.id));
    }
  }, 300, { leading: true }), [account?.id]);

  useEffect(() => {
    if (isOwnAccount)
      dispatch(fetchFavouritedStatuses());
    else {
      if (account) {
        dispatch(fetchAccount(account.id));
        dispatch(fetchAccountFavouritedStatuses(account.id));
      } else {
        dispatch(fetchAccountByUsername(username));
      }
    }
  }, []);

  useEffect(() => {
    if (account && !isOwnAccount) {
      dispatch(fetchAccount(account.id));
      dispatch(fetchAccountFavouritedStatuses(account.id));
    }
  }, [account?.id]);

  if (isUnavailable) {
    return (
      <Column>
        <div className='empty-column-indicator'>
          <FormattedMessage id='empty_column.account_unavailable' defaultMessage='Profile unavailable' />
        </div>
      </Column>
    );
  }

  if (!account) {
    return (
      <MissingIndicator />
    );
  }

  const emptyMessage = isOwnAccount
    ? <FormattedMessage id='empty_column.favourited_statuses' defaultMessage="You don't have any liked posts yet. When you like one, it will show up here." />
    : <FormattedMessage id='empty_column.account_favourited_statuses' defaultMessage="This user doesn't have any liked posts yet." />;

  return (
    <Column label={intl.formatMessage(messages.heading)} withHeader={false} transparent>
      <StatusList
        statusIds={statusIds}
        scrollKey='favourited_statuses'
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
        emptyMessage={emptyMessage}
      />
    </Column>
  );
};

export default Favourites;