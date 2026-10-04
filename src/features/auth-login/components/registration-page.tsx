import { FormattedMessage } from 'react-intl';

import { BigCard } from '@/components/big-card.tsx';
import Text from '@/components/ui/text.tsx';
import { useInstance } from '@/hooks/useInstance.ts';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus.ts';

import RegistrationForm from './registration-form.tsx';

const RegistrationPage: React.FC = () => {
  const { instance } = useInstance();
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