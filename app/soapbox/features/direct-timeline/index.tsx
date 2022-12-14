import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { directComposeById } from 'soapbox/actions/compose';
import { connectDirectStream } from 'soapbox/actions/streaming';
import { expandDirectTimeline } from 'soapbox/actions/timelines';
import AccountSearch from 'soapbox/components/account-search';
import { Column } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import Timeline from '../ui/components/timeline';

const messages = defineMessages({
  heading: { id: 'column.direct', defaultMessage: 'Direct messages' },
  searchPlaceholder: { id: 'direct.search_placeholder', defaultMessage: 'Send a message to…' },
});

const DirectTimeline = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(expandDirectTimeline());
    const disconnect = dispatch(connectDirectStream());

    return (() => {
      disconnect();
    });
  }, []);

  const handleSuggestion = (accountId: string) => {
    dispatch(directComposeById(accountId));
  };

  const handleLoadMore = (maxId: string) => {
    dispatch(expandDirectTimeline({ maxId }));
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
