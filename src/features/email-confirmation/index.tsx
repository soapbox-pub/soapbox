import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { confirmChangedEmail } from '@/actions/security.ts';
import Spinner from '@/components/ui/spinner.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import toast from '@/toast.tsx';
import { buildErrorMessage } from '@/utils/errors.ts';

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

          if (error.data.error) {
            const message = buildErrorMessage(error.data.error);
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
