import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchAccount, fetchAccountByUsername } from 'soapbox/actions/accounts';
import { fetchFavouritedStatuses, expandFavouritedStatuses, fetchAccountFavouritedStatuses, expandAccountFavouritedStatuses } from 'soapbox/actions/favourites';
import { useAccountLookup } from 'soapbox/api/hooks';
import MissingIndicator from 'soapbox/components/missing-indicator';
import StatusList from 'soapbox/components/status-list';
import { Column } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useOwnAccount } from 'soapbox/hooks';

const messages = defineMessages({
  heading: { id: 'column.favourited_statuses', defaultMessage: 'Liked posts' },
});

interface IFavourites {
  params?: {
    username?: string
  }
}

/** Timeline displaying a user's favourited statuses. */
const Favourites: React.FC<IFavourites> = ({ params }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { account: ownAccount } = useOwnAccount();
  const { account, isUnavailable } = useAccountLookup(params?.username, { withRelationship: true });

  const username = params?.username || '';
  const isOwnAccount = username.toLowerCase() === ownAccount?.username?.toLowerCase();

  const timelineKey = isOwnAccount ? 'favourites' : `favourites:${account?.id}`;
  const statusIds = useAppSelector(state => state.status_lists.get(timelineKey)?.items || ImmutableOrderedSet<string>());
  const isLoading = useAppSelector(state => state.status_lists.get(timelineKey)?.isLoading === true);
  const hasMore = useAppSelector(state => !!state.status_lists.get(timelineKey)?.next);

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