import React, { useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { fetchReports } from 'soapbox/actions/admin';
import ScrollableList from 'soapbox/components/scrollable-list';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks';

import Report from '../components/report';

const messages = defineMessages({
  heading: { id: 'column.admin.reports', defaultMessage: 'Reports' },
  modlog: { id: 'column.admin.reports.menu.moderation_log', defaultMessage: 'Moderation Log' },
  emptyMessage: { id: 'admin.reports.empty_message', defaultMessage: 'There are no open reports. If a user gets reported, they will show up here.' },
});

const Reports: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [isLoading, setLoading] = useState(true);

  const reports = useAppSelector(state => state.admin.openReports.toList());

  useEffect(() => {
    dispatch(fetchReports())
      .then(() => setLoading(false))
      .catch(() => {});
  }, []);

  const showLoading = isLoading && reports.count() === 0;

  return (
    <ScrollableList
      isLoading={isLoading}
      showLoading={showLoading}
      scrollKey='admin-reports'
      emptyMessage={intl.formatMessage(messages.emptyMessage)}
      className='divide-y divide-solid divide-gray-200 dark:divide-gray-800'
    >
      {reports.map(report => report && <Report id={report} key={report} />)}
    </ScrollableList>
  );
};

export default Reports;
