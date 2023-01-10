import debounce from 'lodash/debounce';
import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { fetchMutes, expandMutes } from 'soapbox/actions/mutes';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Column, Spinner } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

const messages = defineMessages({
  heading: { id: 'column.mutes', defaultMessage: 'Muted users' },
});

const handleLoadMore = debounce((dispatch) => {
  dispatch(expandMutes());
}, 300, { leading: true });

const Mutes: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const accountIds = useAppSelector((state) => state.user_lists.mutes.items);
  const hasMore = useAppSelector((state) => !!state.user_lists.mutes.next);

  React.useEffect(() => {
    dispatch(fetchMutes());
  }, []);

  if (!accountIds) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = <FormattedMessage id='empty_column.mutes' defaultMessage="You haven't muted any users yet." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='mutes'
        onLoadMore={() => handleLoadMore(dispatch)}
        hasMore={hasMore}
        emptyMessage={emptyMessage}
        itemClassName='pb-4'
      >
        {accountIds.map((id) =>
          <AccountContainer key={id} id={id} actionType='muting' />,
        )}
      </ScrollableList>
    </Column>
  );
};

export default Mutes;
