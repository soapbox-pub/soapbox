import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useBlocks } from 'soapbox/api/hooks';
import Account from 'soapbox/components/account';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Column, Spinner } from 'soapbox/components/ui';

const messages = defineMessages({
  heading: { id: 'column.blocks', defaultMessage: 'Blocks' },
});

const Blocks: React.FC = () => {
  const intl = useIntl();

  const {
    accounts,
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useBlocks();

  if (isLoading) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = <FormattedMessage id='empty_column.blocks' defaultMessage="You haven't blocked any users yet." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='blocks'
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage}
        emptyMessage={emptyMessage}
        emptyMessageCard={false}
        itemClassName='pb-4 last:pb-0'
      >
        {accounts.map((account) => (
          <Account key={account.id} account={account} actionType='blocking' />
        ))}
      </ScrollableList>
    </Column>
  );
};

export default Blocks;
