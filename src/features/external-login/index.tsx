import { FormattedMessage } from 'react-intl';

import { BigCard } from 'soapbox/components/big-card.tsx';

import ExternalLoginForm from './components/external-login-form.tsx';

/** Page for logging into a remote instance */
const ExternalLoginPage: React.FC = () => {
  return (
    <BigCard title={<FormattedMessage id='login_form.header' defaultMessage='Sign In' />}>
      <ExternalLoginForm />
    </BigCard>
  );
};

export default ExternalLoginPage;
