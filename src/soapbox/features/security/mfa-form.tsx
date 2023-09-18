import React, { useEffect, useState } from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { fetchMfa } from 'soapbox/actions/mfa';
import { Column, Stack } from 'soapbox/components/ui';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks';

import DisableOtpForm from './mfa/disable-otp-form';
import EnableOtpForm from './mfa/enable-otp-form';
import OtpConfirmForm from './mfa/otp-confirm-form';

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
