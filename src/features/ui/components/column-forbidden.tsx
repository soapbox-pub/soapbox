import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Column } from 'soapbox/components/ui';

const messages = defineMessages({
  title: { id: 'column_forbidden.title', defaultMessage: 'Forbidden' },
  body: { id: 'column_forbidden.body', defaultMessage: 'You do not have permission to access this page.' },
});

const ColumnForbidden = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <div className='error-column flex min-h-[160px] flex-1 flex-col items-center justify-center rounded-lg bg-primary-50 p-10 text-center text-gray-900 dark:bg-gray-700 dark:text-gray-300'>
        {intl.formatMessage(messages.body)}
      </div>
    </Column>
  );
};

export default ColumnForbidden;
