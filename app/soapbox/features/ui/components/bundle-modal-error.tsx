import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Modal } from 'soapbox/components/ui';

const messages = defineMessages({
  error: { id: 'bundle_modal_error.message', defaultMessage: 'Something went wrong while loading this modal.' },
  retry: { id: 'bundle_modal_error.retry', defaultMessage: 'Try again' },
  close: { id: 'bundle_modal_error.close', defaultMessage: 'Close' },
});

interface IBundleModalError {
  onRetry: () => void
  onClose: () => void
}

const BundleModalError: React.FC<IBundleModalError> = ({ onRetry, onClose }) => {
  const intl = useIntl();

  const handleRetry = () => {
    onRetry();
  };

  return (
    <Modal
      title={intl.formatMessage(messages.error)}
      confirmationAction={onClose}
      confirmationText={intl.formatMessage(messages.close)}
      secondaryAction={handleRetry}
      secondaryText={intl.formatMessage(messages.retry)}
    />
  );
};

export default BundleModalError;
