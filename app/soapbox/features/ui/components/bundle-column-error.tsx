import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Column, Stack, Text, IconButton } from 'soapbox/components/ui';

const messages = defineMessages({
  title: { id: 'bundle_column_error.title', defaultMessage: 'Network error' },
  body: { id: 'bundle_column_error.body', defaultMessage: 'Something went wrong while loading this page.' },
  retry: { id: 'bundle_column_error.retry', defaultMessage: 'Try again' },
});

interface IBundleColumnError {
  onRetry: () => void
}

const BundleColumnError: React.FC<IBundleColumnError> = ({ onRetry }) => {
  const intl = useIntl();

  const handleRetry = () => {
    onRetry();
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Stack space={4} alignItems='center' justifyContent='center' className='min-h-[160px] rounded-lg p-10'>
        <IconButton
          iconClassName='h-10 w-10'
          title={intl.formatMessage(messages.retry)}
          src={require('@tabler/icons/refresh.svg')}
          onClick={handleRetry}
        />

        <Text align='center' theme='muted'>{intl.formatMessage(messages.body)}</Text>
      </Stack>
    </Column>
  );
};

export default BundleColumnError;
