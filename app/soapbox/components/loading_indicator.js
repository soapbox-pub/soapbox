import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Stack, Text } from './ui';

const Spinner = () => (
  <div className='loading-indicator__container'>
    <div className='loading-indicator__figure' />
  </div>
);

const LoadingIndicator = () => (
  <div className='py-5'>
    <Stack space={2} justifyContent='center' alignItems='center'>
      <Spinner />

      <Text theme='muted' tracking='wide'>
        <FormattedMessage id='loading_indicator.label' defaultMessage='Loading…' />
      </Text>
    </Stack>
  </div>
);

export default LoadingIndicator;
