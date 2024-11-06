import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useAdminAccounts } from 'soapbox/api/hooks/admin/useAdminAccounts';
import Account from 'soapbox/components/account';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Column } from 'soapbox/components/ui';

const messages = defineMessages({
  heading: { id: 'column.admin.users', defaultMessage: 'Users' },
  empty: { id: 'admin.user_index.empty', defaultMessage: 'No users found.' },
  searchPlaceholder: { id: 'admin.user_index.search_input_placeholder', defaultMessage: 'Who are you looking for?' },
});

const UserIndex: React.FC = () => {
  const intl = useIntl();

  const { accounts, isLoading, hasNextPage, fetchNextPage } = useAdminAccounts({
    local: true,
    active: true,
    pending: false,
    disabled: false,
    silenced: false,
    suspended: false,
  });

  const handleLoadMore = () => {
    if (!isLoading) {
      fetchNextPage();
    }
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='user-index'
        hasMore={hasNextPage}
        isLoading={isLoading}
        showLoading={isLoading}
        onLoadMore={handleLoadMore}
        emptyMessage={intl.formatMessage(messages.empty)}
        className='mt-4'
        itemClassName='pb-4'
      >
        {accounts.map((account) =>
          <Account key={account.id} account={account} withDate />,
        )}
      </ScrollableList>
    </Column>
  );
};

export default UserIndex;
