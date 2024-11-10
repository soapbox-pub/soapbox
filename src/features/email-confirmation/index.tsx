import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { confirmChangedEmail } from 'soapbox/actions/security.ts';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import { useAppDispatch } from 'soapbox/hooks/index.ts';
import toast from 'soapbox/toast.tsx';
import { buildErrorMessage } from 'soapbox/utils/errors.ts';

const Statuses = {
  IDLE: 'IDLE',
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
};

const messages = defineMessages({
  success: { id: 'email_confirmation.success', defaultMessage: 'Your email has been confirmed!' },
});

const token = new URLSearchParams(window.location.search).get('confirmation_token');

const EmailConfirmation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [status, setStatus] = useState(Statuses.IDLE);

  useEffect(() => {
    if (token) {
      dispatch(confirmChangedEmail(token))
        .then(() => {
          setStatus(Statuses.SUCCESS);

          toast.success(intl.formatMessage(messages.success));
        })
        .catch((error) => {
          setStatus(Statuses.FAIL);

          if (error.response.data.error) {
            const message = buildErrorMessage(error.response.data.error);
            toast.error(message);
          }
        });
    }
  }, [token]);

  if (!token || status === Statuses.SUCCESS || status === Statuses.FAIL) {
    return <Redirect to='/' />;
  }

  return (
    <Spinner />
  );
};

export default EmailConfirmation;
