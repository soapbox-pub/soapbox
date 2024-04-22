import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useReports } from 'soapbox/api/hooks/admin';
import ScrollableList from 'soapbox/components/scrollable-list';

import Report from '../components/report';

const messages = defineMessages({
  heading: { id: 'column.admin.reports', defaultMessage: 'Reports' },
  modlog: { id: 'column.admin.reports.menu.moderation_log', defaultMessage: 'Moderation Log' },
  emptyMessage: { id: 'admin.reports.empty_message', defaultMessage: 'There are no open reports. If a user gets reported, they will show up here.' },
});

const Reports: React.FC = () => {
  const intl = useIntl();

  const { reports, isLoading, fetchEntities } = useReports({ resolved: false });

  useEffect(() => {
    fetchEntities();
  }, []);

  const showLoading = isLoading && reports.length === 0;

  return (
    <ScrollableList
      isLoading={isLoading}
      showLoading={showLoading}
      scrollKey='admin-reports'
      emptyMessage={intl.formatMessage(messages.emptyMessage)}
      listClassName='divide-y divide-solid divide-gray-200 dark:divide-gray-800'
    >
      {reports.map(report => report && <Report id={report.id} key={report.id} />)}
    </ScrollableList>
  );
};

export default Reports;
