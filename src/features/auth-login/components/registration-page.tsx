import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Card, CardTitle, Stack } from 'soapbox/components/ui';

import RegistrationForm from './registration-form';

const RegistrationPage: React.FC = () => {
  return (
    <Card variant='rounded'>
      <Stack space={2}>
        <CardTitle title={<FormattedMessage id='column.registration' defaultMessage='Sign Up' />} />
        <RegistrationForm />
      </Stack>
    </Card>
  );
};

export default RegistrationPage;