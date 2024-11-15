import debounce from 'lodash/debounce';
import { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchScheduledStatuses, expandScheduledStatuses } from 'soapbox/actions/scheduled-statuses.ts';
import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

import ScheduledStatus from './components/scheduled-status.tsx';

const messages = defineMessages({
  heading: { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled Posts' },
});

const handleLoadMore = debounce((dispatch) => {
  dispatch(expandScheduledStatuses());
}, 300, { leading: true });

const ScheduledStatuses = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const statusIds = useAppSelector((state) => state.status_lists.get('scheduled_statuses')!.items);
  const isLoading = useAppSelector((state) => state.status_lists.get('scheduled_statuses')!.isLoading);
  const hasMore = useAppSelector((state) => !!state.status_lists.get('scheduled_statuses')!.next);

  useEffect(() => {
    dispatch(fetchScheduledStatuses());
  }, []);

  const emptyMessage = <FormattedMessage id='empty_column.scheduled_statuses' defaultMessage="You don't have any scheduled statuses yet. When you add one, it will show up here." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='scheduled_statuses'
        hasMore={hasMore}
        isLoading={typeof isLoading === 'boolean' ? isLoading : true}
        onLoadMore={() => handleLoadMore(dispatch)}
        emptyMessage={emptyMessage}
        listClassName='divide-y divide-solid divide-gray-200 dark:divide-gray-800'
      >
        {statusIds.map((id: string) => <ScheduledStatus key={id} statusId={id} />)}
      </ScrollableList>
    </Column>
  );
};

export default ScheduledStatuses;
