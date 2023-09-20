import React from 'react';
import { FormattedMessage } from 'react-intl';

import { BigCard } from 'soapbox/components/big-card';

import RegistrationForm from './registration-form';

const RegistrationPage: React.FC = () => {
  return (
    <BigCard title={<FormattedMessage id='column.registration' defaultMessage='Sign Up' />}>
      <RegistrationForm />
    </BigCard>
  );
};

export default RegistrationPage;