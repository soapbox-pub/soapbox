import debounce from 'lodash/debounce';
import React, { useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { expandUserIndex, fetchUserIndex, setUserIndexQuery } from 'soapbox/actions/admin';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Column, Input } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

const messages = defineMessages({
  heading: { id: 'column.admin.users', defaultMessage: 'Users' },
  empty: { id: 'admin.user_index.empty', defaultMessage: 'No users found.' },
  searchPlaceholder: { id: 'admin.user_index.search_input_placeholder', defaultMessage: 'Who are you looking for?' },
});

const UserIndex: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { isLoading, items, total, query, next } = useAppSelector((state) => state.admin_user_index);

  const handleLoadMore = () => {
    if (!isLoading) dispatch(expandUserIndex());
  };

  const updateQuery = useCallback(debounce(() => {
    dispatch(fetchUserIndex());
  }, 900, { leading: true }), []);

  const handleQueryChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    dispatch(setUserIndexQuery(e.target.value));
    updateQuery();
  };

  useEffect(() => {
    updateQuery();
  }, []);


  const hasMore = items.count() < total && !!next;

  const showLoading = isLoading && items.isEmpty();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Input
        value={query}
        onChange={handleQueryChange}
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
      />
      <ScrollableList
        scrollKey='user-index'
        hasMore={hasMore}
        isLoading={isLoading}
        showLoading={showLoading}
        onLoadMore={handleLoadMore}
        emptyMessage={intl.formatMessage(messages.empty)}
        className='mt-4'
        itemClassName='pb-4'
      >
        {items.map(id =>
          <AccountContainer key={id} id={id} withDate />,
        )}
      </ScrollableList>
    </Column>
  );
};

export default UserIndex;
