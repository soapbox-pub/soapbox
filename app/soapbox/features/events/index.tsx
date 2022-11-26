import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Column } from 'soapbox/components/ui';

const messages = defineMessages({
  title: { id: 'column.events', defaultMessage: 'Events' },
});

const Events = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.title)} />
  );
};

export default Events;
