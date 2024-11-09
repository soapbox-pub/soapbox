import { FormattedMessage } from 'react-intl';

import { BigCard } from 'soapbox/components/big-card';

import ExternalLoginForm from './components/external-login-form';

/** Page for logging into a remote instance */
const ExternalLoginPage: React.FC = () => {
  return (
    <BigCard title={<FormattedMessage id='login_form.header' defaultMessage='Sign In' />}>
      <ExternalLoginForm />
    </BigCard>
  );
};

export default ExternalLoginPage;
