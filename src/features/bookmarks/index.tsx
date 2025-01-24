import { debounce } from 'es-toolkit';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useBookmarks } from 'soapbox/api/hooks/index.ts';
import PullToRefresh from 'soapbox/components/pull-to-refresh.tsx';
import PureStatusList from 'soapbox/components/pure-status-list.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
});

const Bookmarks: React.FC = () => {
  const intl = useIntl();

  const handleLoadMore = debounce(() => {
    fetchNextPage();
  }, 300, { edges: ['leading'] });

  const { bookmarks, isLoading, hasNextPage, fetchEntities, fetchNextPage } = useBookmarks();

  const handleRefresh = () => {
    return fetchEntities();
  };

  const emptyMessage = <FormattedMessage id='empty_column.bookmarks' defaultMessage="You don't have any bookmarks yet. When you add one, it will show up here." />;

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent>
      <PullToRefresh onRefresh={handleRefresh}>
        <PureStatusList
          className='black:p-4 black:sm:p-5'
          statuses={bookmarks}
          scrollKey='bookmarked_statuses'
          hasMore={hasNextPage}
          isLoading={typeof isLoading === 'boolean' ? isLoading : true}
          onLoadMore={() => handleLoadMore()}
          emptyMessage={emptyMessage}
        />
      </PullToRefresh>
    </Column>

  );
};

export default Bookmarks;
