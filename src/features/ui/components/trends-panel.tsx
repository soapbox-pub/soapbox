import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { setFilter } from 'soapbox/actions/search.ts';
import Hashtag from 'soapbox/components/hashtag.tsx';
import { Text, Widget } from 'soapbox/components/ui/index.ts';
import PlaceholderSidebarTrends from 'soapbox/features/placeholder/components/placeholder-sidebar-trends.tsx';
import { useAppDispatch } from 'soapbox/hooks/index.ts';
import useTrends from 'soapbox/queries/trends.ts';

interface ITrendsPanel {
  limit: number;
}

const messages = defineMessages({
  viewAll: {
    id: 'trends_panel.view_all',
    defaultMessage: 'View all',
  },
});

const TrendsPanel = ({ limit }: ITrendsPanel) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { data: trends, isFetching } = useTrends();

  const setHashtagsFilter = () => {
    dispatch(setFilter('hashtags'));
  };

  if (!isFetching && !trends?.length) {
    return null;
  }

  return (
    <Widget
      title={<FormattedMessage id='trends.title' defaultMessage='Trends' />}
      action={
        <Link className='text-right' to='/search' onClick={setHashtagsFilter}>
          <Text tag='span' theme='primary' size='sm' className='hover:underline'>
            {intl.formatMessage(messages.viewAll)}
          </Text>
        </Link>
      }
    >
      {isFetching ? (
        <PlaceholderSidebarTrends limit={limit} />
      ) : (
        trends?.slice(0, limit).map((hashtag) => (
          <Hashtag key={hashtag.name} hashtag={hashtag} />
        ))
      )}
    </Widget>
  );
};

export default TrendsPanel;
