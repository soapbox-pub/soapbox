import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedDate, useIntl } from 'react-intl';

import { fetchModerationLog } from 'soapbox/actions/admin';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Column, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { AdminLog } from 'soapbox/types/entities';

const messages = defineMessages({
  heading: { id: 'column.admin.moderation_log', defaultMessage: 'Moderation Log' },
  emptyMessage: { id: 'admin.moderation_log.empty_message', defaultMessage: 'You have not performed any moderation actions yet. When you do, a history will be shown here.' },
});

const ModerationLog = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const items = useAppSelector((state) => {
    return state.admin_log.index.map((i) => state.admin_log.items.get(String(i)));
  });

  const hasMore = useAppSelector((state) => state.admin_log.total - state.admin_log.index.count() > 0);

  const [isLoading, setIsLoading] = useState(true);
  const [lastPage, setLastPage] = useState(0);

  const showLoading = isLoading && items.count() === 0;

  useEffect(() => {
    dispatch(fetchModerationLog())
      .then(() => {
        setIsLoading(false);
        setLastPage(1);
      })
      .catch(() => { });
  }, []);

  const handleLoadMore = () => {
    const page = lastPage + 1;

    setIsLoading(true);
    dispatch(fetchModerationLog({ page }))
      .then(() => {
        setIsLoading(false);
        setLastPage(page);
      }).catch(() => { });
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        isLoading={isLoading}
        showLoading={showLoading}
        scrollKey='moderation-log'
        emptyMessage={intl.formatMessage(messages.emptyMessage)}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        className='divide-y divide-solid divide-gray-200 dark:divide-gray-800'
      >
        {items.map(item => item && (
          <LogItem key={item.id} log={item} />
        ))}
      </ScrollableList>
    </Column>
  );
};

interface ILogItem {
  log: AdminLog
}

const LogItem: React.FC<ILogItem> = ({ log }) => {
  return (
    <Stack space={2} className='p-4'>
      <Text>{log.message}</Text>

      <Text theme='muted' size='xs'>
        <FormattedDate
          value={new Date(log.time * 1000)}
          hour12
          year='numeric'
          month='short'
          day='2-digit'
          hour='numeric'
          minute='2-digit'
        />
      </Text>
    </Stack>
  );
};

export default ModerationLog;
