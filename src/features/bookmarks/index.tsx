import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import debounce from 'lodash/debounce';
import { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchBookmarkedStatuses, expandBookmarkedStatuses } from 'soapbox/actions/bookmarks.ts';
import PullToRefresh from 'soapbox/components/pull-to-refresh.tsx';
import StatusList from 'soapbox/components/status-list.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useIsMobile } from 'soapbox/hooks/useIsMobile.ts';
import { useTheme } from 'soapbox/hooks/useTheme.ts';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
});

const handleLoadMore = debounce((dispatch) => {
  dispatch(expandBookmarkedStatuses());
}, 300, { leading: true });

interface IBookmarks {
  params?: {
    id?: string;
  };
}

const Bookmarks: React.FC<IBookmarks> = ({ params }) => {
  const intl = useIntl();

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useIsMobile();

  const bookmarks = 'bookmarks';

  const statusIds = useAppSelector((state) => state.status_lists.get(bookmarks)?.items || ImmutableOrderedSet<string>());
  const isLoading = useAppSelector((state) => state.status_lists.get(bookmarks)?.isLoading === true);
  const hasMore = useAppSelector((state) => !!state.status_lists.get(bookmarks)?.next);

  useEffect(() => {
    dispatch(fetchBookmarkedStatuses());
  }, []);

  const handleRefresh = () => {
    return dispatch(fetchBookmarkedStatuses());
  };

  const emptyMessage = <FormattedMessage id='empty_column.bookmarks' defaultMessage="You don't have any bookmarks yet. When you add one, it will show up here." />;

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent>
      <PullToRefresh onRefresh={handleRefresh}>
        <StatusList
          className='black:p-4 black:sm:p-5'
          statusIds={statusIds}
          scrollKey='bookmarked_statuses'
          hasMore={hasMore}
          isLoading={typeof isLoading === 'boolean' ? isLoading : true}
          onLoadMore={() => handleLoadMore(dispatch)}
          emptyMessage={emptyMessage}
          divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
        />
      </PullToRefresh>
    </Column>

  );
};

export default Bookmarks;
