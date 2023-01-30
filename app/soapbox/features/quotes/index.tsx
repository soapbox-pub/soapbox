import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import { debounce } from 'lodash';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import { expandStatusQuotes, fetchStatusQuotes } from 'soapbox/actions/status-quotes';
import StatusList from 'soapbox/components/status-list';
import { Column } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

const messages = defineMessages({
  heading: { id: 'column.quotes', defaultMessage: 'Post quotes' },
});

const handleLoadMore = debounce((statusId: string, dispatch: React.Dispatch<any>) =>
  dispatch(expandStatusQuotes(statusId)), 300, { leading: true });

const Quotes: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { statusId } = useParams<{ statusId: string }>();

  const statusIds = useAppSelector((state) => state.status_lists.getIn([`quotes:${statusId}`, 'items'], ImmutableOrderedSet<string>()));
  const isLoading = useAppSelector((state) => state.status_lists.getIn([`quotes:${statusId}`, 'isLoading'], true));
  const hasMore = useAppSelector((state) => !!state.status_lists.getIn([`quotes:${statusId}`, 'next']));

  React.useEffect(() => {
    dispatch(fetchStatusQuotes(statusId));
  }, [statusId]);

  const handleRefresh = async() => {
    await dispatch(fetchStatusQuotes(statusId));
  };

  const emptyMessage = <FormattedMessage id='empty_column.quotes' defaultMessage='This post has not been quoted yet.' />;

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent>
      <StatusList
        statusIds={statusIds as ImmutableOrderedSet<string>}
        scrollKey={`quotes:${statusId}`}
        hasMore={hasMore}
        isLoading={typeof isLoading === 'boolean' ? isLoading : true}
        onLoadMore={() => handleLoadMore(statusId, dispatch)}
        onRefresh={handleRefresh}
        emptyMessage={emptyMessage}
        divideType='space'
      />
    </Column>
  );
};

export default Quotes;
