import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { useMutes } from 'soapbox/api/hooks';
import Account from 'soapbox/components/account';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Column, Spinner } from 'soapbox/components/ui';

const messages = defineMessages({
  heading: { id: 'column.mutes', defaultMessage: 'Muted users' },
});

const Mutes: React.FC = () => {
  const intl = useIntl();

  const {
    accounts,
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useMutes();

  if (isLoading) {
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
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage}
        emptyMessage={emptyMessage}
        itemClassName='pb-4'
      >
        {accounts.map((account) => (
          <Account key={account.id} account={account} actionType='muting' />
        ))}
      </ScrollableList>
    </Column>
  );
};

export default Mutes;
