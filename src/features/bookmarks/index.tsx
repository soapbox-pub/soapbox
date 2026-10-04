import { debounce } from 'es-toolkit';
import { useCallback, useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { expandBookmarkedStatuses, fetchBookmarkedStatuses } from '@/actions/bookmarks.ts';
import PullToRefresh from '@/components/pull-to-refresh.tsx';
import StatusList from '@/components/status-list.tsx';
import { Column } from '@/components/ui/column.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
});

const Bookmarks: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const statusIds = useAppSelector((state) => state.status_lists.bookmarks.items);
  const isLoading = useAppSelector((state) => state.status_lists.bookmarks.isLoading !== false);
  const hasMore = useAppSelector((state) => !!state.status_lists.bookmarks.next);

  const handleLoadMore = useCallback(debounce(() => {
    dispatch(expandBookmarkedStatuses());
  }, 300, { edges: ['leading'] }), []);

  const handleRefresh = async () => {
    await dispatch(fetchBookmarkedStatuses());
  };

  useEffect(() => {
    dispatch(fetchBookmarkedStatuses());
  }, []);

  const emptyMessage = <FormattedMessage id='empty_column.bookmarks' defaultMessage="You don't have any bookmarks yet. When you add one, it will show up here." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <PullToRefresh onRefresh={handleRefresh}>
        <StatusList
          className='black:p-4 black:sm:p-5'
          statusIds={statusIds}
          scrollKey='bookmarked_statuses'
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={handleLoadMore}
          emptyMessage={emptyMessage}
        />
      </PullToRefresh>
    </Column>
  );
};

export default Bookmarks;
