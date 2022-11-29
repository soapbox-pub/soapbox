// import throttle from 'lodash/throttle';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
// import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { CardHeader, CardTitle } from './ui';

const messages = defineMessages({
  back: { id: 'column_back_button.label', defaultMessage: 'Back' },
});

interface ISubNavigation {
  message: React.ReactNode,
  /** @deprecated Unused. */
  settings?: React.ComponentType,
}

const SubNavigation: React.FC<ISubNavigation> = ({ message }) => {
  const intl = useIntl();
  const history = useHistory();

  const handleBackClick = () => {
    if (window.history && window.history.length === 1) {
      history.push('/');
    } else {
      history.goBack();
    }
  };

  return (
    <CardHeader
      aria-label={intl.formatMessage(messages.back)}
      onBackClick={handleBackClick}
    >
      <CardTitle title={message} />
    </CardHeader>
  );
};

export default SubNavigation;
