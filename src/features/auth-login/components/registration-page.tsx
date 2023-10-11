import React from 'react';
import { FormattedMessage } from 'react-intl';

import { BigCard } from 'soapbox/components/big-card';
import { Text } from 'soapbox/components/ui';
import { useInstance, useRegistrationStatus } from 'soapbox/hooks';

import RegistrationForm from './registration-form';

const RegistrationPage: React.FC = () => {
  const instance = useInstance();
  const { isOpen } = useRegistrationStatus();

  if (!isOpen) {
    return (
      <BigCard title={<FormattedMessage id='registration.closed_title' defaultMessage='Registrations Closed' />}>
        <Text theme='muted' align='center'>
          <FormattedMessage
            id='registration.closed_message'
            defaultMessage='{instance} is not accepting new members'
            values={{ instance: instance.title }}
          />
        </Text>
      </BigCard>
    );
  }

  return (
    <BigCard title={<FormattedMessage id='column.registration' defaultMessage='Sign Up' />}>
      <RegistrationForm />
    </BigCard>
  );
};

export default RegistrationPage;