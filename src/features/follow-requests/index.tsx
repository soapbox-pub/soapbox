import debounce from 'lodash/debounce';
import { useEffect } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { fetchFollowRequests, expandFollowRequests } from 'soapbox/actions/accounts.ts';
import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import { Column, Spinner } from 'soapbox/components/ui/index.ts';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks/index.ts';

import AccountAuthorize from './components/account-authorize.tsx';

const messages = defineMessages({
  heading: { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
});

const handleLoadMore = debounce((dispatch) => {
  dispatch(expandFollowRequests());
}, 300, { leading: true });

const FollowRequests: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const accountIds = useAppSelector((state) => state.user_lists.follow_requests.items);
  const hasMore = useAppSelector((state) => !!state.user_lists.follow_requests.next);

  useEffect(() => {
    dispatch(fetchFollowRequests());
  }, []);

  if (!accountIds) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = <FormattedMessage id='empty_column.follow_requests' defaultMessage="You don't have any follow requests yet. When you receive one, it will show up here." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='follow_requests'
        onLoadMore={() => handleLoadMore(dispatch)}
        hasMore={hasMore}
        emptyMessage={emptyMessage}
      >
        {accountIds.map(id =>
          <AccountAuthorize key={id} id={id} />,
        )}
      </ScrollableList>
    </Column>
  );
};

export default FollowRequests;
