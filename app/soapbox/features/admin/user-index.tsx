import debounce from 'lodash/debounce';
import React, { useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { expandUserIndex, fetchUserIndex, setUserIndexQuery } from 'soapbox/actions/admin';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Column } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import { SimpleForm, TextInput } from 'soapbox/features/forms';
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
    dispatch(expandUserIndex());
  };

  const updateQuery = useCallback(debounce(() => {
    dispatch(fetchUserIndex());
  }, 900, { leading: true }), []);

  const handleQueryChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    dispatch(setUserIndexQuery(e.target.value));
  };

  useEffect(() => {
    updateQuery();
  }, [query]);

  const hasMore = items.count() < total && next !== null;

  const showLoading = isLoading && items.isEmpty();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <SimpleForm style={{ paddingBottom: 0 }}>
        <TextInput
          value={query}
          onChange={handleQueryChange}
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
        />
      </SimpleForm>
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
