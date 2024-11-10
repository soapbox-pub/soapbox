import { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { directComposeById } from 'soapbox/actions/compose.ts';
import { expandDirectTimeline } from 'soapbox/actions/timelines.ts';
import { useDirectStream } from 'soapbox/api/hooks/index.ts';
import AccountSearch from 'soapbox/components/account-search.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks/index.ts';

import Timeline from '../ui/components/timeline.tsx';

const messages = defineMessages({
  heading: { id: 'column.direct', defaultMessage: 'Direct messages' },
  searchPlaceholder: { id: 'direct.search_placeholder', defaultMessage: 'Send a message to…' },
});

const DirectTimeline = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const next = useAppSelector(state => state.timelines.get('direct')?.next);

  useDirectStream();

  useEffect(() => {
    dispatch(expandDirectTimeline());
  }, []);

  const handleSuggestion = (accountId: string) => {
    dispatch(directComposeById(accountId));
  };

  const handleLoadMore = (maxId: string) => {
    dispatch(expandDirectTimeline({ url: next, maxId }));
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <AccountSearch
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        onSelected={handleSuggestion}
      />

      <Timeline
        scrollKey='direct_timeline'
        timelineId='direct'
        onLoadMore={handleLoadMore}
        emptyMessage={<FormattedMessage id='empty_column.direct' defaultMessage="You don't have any direct messages yet. When you send or receive one, it will show up here." />}
        divideType='border'
      />
    </Column>
  );
};

export default DirectTimeline;
