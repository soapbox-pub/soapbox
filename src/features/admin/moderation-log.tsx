import { defineMessages, FormattedDate, useIntl } from 'react-intl';

import { useModerationLog } from 'soapbox/api/hooks/admin';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Column, Stack, Text } from 'soapbox/components/ui';

import type { ModerationLogEntry } from 'soapbox/schemas';

const messages = defineMessages({
  heading: { id: 'column.admin.moderation_log', defaultMessage: 'Moderation Log' },
  emptyMessage: { id: 'admin.moderation_log.empty_message', defaultMessage: 'You have not performed any moderation actions yet. When you do, a history will be shown here.' },
});

const ModerationLog = () => {
  const intl = useIntl();

  const {
    data,
    hasNextPage,
    isLoading,
    fetchNextPage,
  } = useModerationLog();

  const showLoading = isLoading && data.length === 0;

  const handleLoadMore = () => {
    fetchNextPage();
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        isLoading={isLoading}
        showLoading={showLoading}
        scrollKey='moderation-log'
        emptyMessage={intl.formatMessage(messages.emptyMessage)}
        hasMore={hasNextPage}
        onLoadMore={handleLoadMore}
        listClassName='divide-y divide-solid divide-gray-200 dark:divide-gray-800'
      >
        {data.map(item => item && (
          <LogItem key={item.id} log={item} />
        ))}
      </ScrollableList>
    </Column>
  );
};

interface ILogItem {
  log: ModerationLogEntry;
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
