import { useEffect, useState } from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { fetchMfa } from 'soapbox/actions/mfa.ts';
import { Column } from 'soapbox/components/ui/column.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks/index.ts';

import DisableOtpForm from './mfa/disable-otp-form.tsx';
import EnableOtpForm from './mfa/enable-otp-form.tsx';
import OtpConfirmForm from './mfa/otp-confirm-form.tsx';

/*
Security settings page for user account
Routed to /settings/mfa
Includes following features:
- Set up Multi-factor Auth
*/

const messages = defineMessages({
  heading: { id: 'column.mfa', defaultMessage: 'Multi-Factor Authentication' },
});

const MfaForm: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [displayOtpForm, setDisplayOtpForm] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchMfa());
  }, []);

  const handleSetupProceedClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setDisplayOtpForm(true);
  };

  const mfa = useAppSelector((state) => state.security.get('mfa'));

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      {mfa.getIn(['settings', 'totp']) ? (
        <DisableOtpForm />
      ) : (
        <Stack space={4}>
          <EnableOtpForm displayOtpForm={displayOtpForm} handleSetupProceedClick={handleSetupProceedClick} />
          {displayOtpForm && <OtpConfirmForm />}
        </Stack>
      )}
    </Column>
  );
};

export default MfaForm;
