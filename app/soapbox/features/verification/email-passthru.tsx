import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory, useParams } from 'react-router-dom';

import { confirmEmailVerification } from 'soapbox/actions/verification';
import { Icon, Spinner, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import toast from 'soapbox/toast';

import { ChallengeTypes } from './index';

import type { AxiosError } from 'axios';

const Statuses = {
  IDLE: 'IDLE',
  SUCCESS: 'SUCCESS',
  GENERIC_FAIL: 'GENERIC_FAIL',
  TOKEN_NOT_FOUND: 'TOKEN_NOT_FOUND',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
};

const messages = defineMessages({
  emailConfirmedHeading: { id: 'email_passthru.confirmed.heading', defaultMessage: 'Email Confirmed!' },
  emailConfirmedBody: { id: 'email_passthru.confirmed.body', defaultMessage: 'Close this tab and continue the registration process on the {bold} from which you sent this email confirmation.' },
  genericFailHeading: { id: 'email_passthru.generic_fail.heading', defaultMessage: 'Something Went Wrong' },
  genericFailBody: { id: 'email_passthru.generic_fail.body', defaultMessage: 'Please request a new email confirmation.' },
  tokenNotFoundHeading: { id: 'email_passthru.token_not_found.heading', defaultMessage: 'Invalid Token' },
  tokenNotFoundBody: { id: 'email_passthru.token_not_found.body', defaultMessage: 'Your email token was not found. Please request a new email confirmation from the {bold} from which you sent this email confirmation.' },
  tokenExpiredHeading: { id: 'email_passthru.token_expired.heading', defaultMessage: 'Token Expired' },
  tokenExpiredBody: { id: 'email_passthru.token_expired.body', defaultMessage: 'Your email token has expired. Please request a new email confirmation from the {bold} from which you sent this email confirmation.' },
  emailConfirmed: { id: 'email_passthru.success', defaultMessage: 'Your email has been verified!' },
  genericFail: { id: 'email_passthru.fail.generic', defaultMessage: 'Unable to confirm your email' },
  tokenExpired: { id: 'email_passthru.fail.expired', defaultMessage: 'Your email token has expired' },
  tokenNotFound: { id: 'email_passthru.fail.not_found', defaultMessage: 'Your email token is invalid.' },
  invalidToken: { id: 'email_passthru.fail.invalid_token', defaultMessage: 'Your token is invalid' },
});

const Success = () => {
  const intl = useIntl();
  const history = useHistory();
  const currentChallenge = useAppSelector((state) => state.verification.currentChallenge as ChallengeTypes);

  React.useEffect(() => {
    // Bypass the user straight to the next step.
    if (currentChallenge === ChallengeTypes.SMS) {
      history.push('/verify');
    }
  }, [currentChallenge]);

  return (
    <Stack space={4} alignItems='center'>
      <Icon src={require('@tabler/icons/circle-check.svg')} className='h-10 w-10 text-primary-600 dark:text-primary-400' />
      <Text size='3xl' weight='semibold' align='center'>
        {intl.formatMessage(messages.emailConfirmedHeading)}
      </Text>
      <Text theme='muted' align='center'>
        {intl.formatMessage(messages.emailConfirmedBody, { bold: <Text tag='span' weight='medium'>same device</Text> })}
      </Text>
    </Stack>
  );
};

const GenericFail = () => {
  const intl = useIntl();

  return (
    <Stack space={4} alignItems='center'>
      <Icon src={require('@tabler/icons/circle-x.svg')} className='h-10 w-10 text-danger-600' />
      <Text size='3xl' weight='semibold' align='center'>
        {intl.formatMessage(messages.genericFailHeading)}
      </Text>
      <Text theme='muted' align='center'>
        {intl.formatMessage(messages.genericFailBody)}
      </Text>
    </Stack>
  );
};

const TokenNotFound = () => {
  const intl = useIntl();

  return (
    <Stack space={4} alignItems='center'>
      <Icon src={require('@tabler/icons/circle-x.svg')} className='h-10 w-10 text-danger-600' />
      <Text size='3xl' weight='semibold' align='center'>
        {intl.formatMessage(messages.tokenNotFoundHeading)}
      </Text>
      <Text theme='muted' align='center'>
        {intl.formatMessage(messages.tokenNotFoundBody, { bold: <Text tag='span' weight='medium'>same device</Text> })}

      </Text>
    </Stack>
  );
};

const TokenExpired = () => {
  const intl = useIntl();

  return (
    <Stack space={4} alignItems='center'>
      <Icon src={require('@tabler/icons/circle-x.svg')} className='h-10 w-10 text-danger-600' />
      <Text size='3xl' weight='semibold' align='center'>
        {intl.formatMessage(messages.tokenExpiredHeading)}
      </Text>
      <Text theme='muted' align='center'>
        {intl.formatMessage(messages.tokenExpiredBody, { bold: <Text tag='span' weight='medium'>same device</Text> })}
      </Text>
    </Stack>
  );
};

const EmailPassThru = () => {
  const { token } = useParams<{ token: string }>();

  const dispatch = useAppDispatch();
  const intl = useIntl();

  const [status, setStatus] = React.useState(Statuses.IDLE);

  React.useEffect(() => {
    if (token) {
      dispatch(confirmEmailVerification(token))
        .then(() => {
          setStatus(Statuses.SUCCESS);
          toast.success(intl.formatMessage(messages.emailConfirmed));
        })
        .catch((error: AxiosError<any>) => {
          const errorKey = error?.response?.data?.error;
          let message = intl.formatMessage(messages.genericFail);

          if (errorKey) {
            switch (errorKey) {
              case 'token_expired':
                message = intl.formatMessage(messages.tokenExpired);
                setStatus(Statuses.TOKEN_EXPIRED);
                break;
              case 'token_not_found':
                message = intl.formatMessage(messages.tokenNotFound);
                message = intl.formatMessage(messages.invalidToken);
                setStatus(Statuses.TOKEN_NOT_FOUND);
                break;
              default:
                setStatus(Statuses.GENERIC_FAIL);
                break;
            }
          }

          toast.error(message);
        });
    }
  }, [token]);

  switch (status) {
    case Statuses.SUCCESS:
      return <Success />;
    case Statuses.TOKEN_EXPIRED:
      return <TokenExpired />;
    case Statuses.TOKEN_NOT_FOUND:
      return <TokenNotFound />;
    case Statuses.GENERIC_FAIL:
      return <GenericFail />;
    default:
      return <Spinner />;
  }
};

export default EmailPassThru;
