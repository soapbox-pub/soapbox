import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { resetPasswordConfirm } from 'soapbox/actions/security';
import { Button, Form, FormActions, FormGroup, Input } from 'soapbox/components/ui';
import PasswordIndicator from 'soapbox/features/verification/components/password-indicator';
import { useAppDispatch, useFeatures } from 'soapbox/hooks';

const token = new URLSearchParams(window.location.search).get('reset_password_token');

const messages = defineMessages({
  resetPasswordFail: { id: 'reset_password.fail', defaultMessage: 'Expired token, please try again.' },
  passwordPlaceholder: { id: 'reset_password.password.placeholder', defaultMessage: 'Placeholder' },
});

const Statuses = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
};

const PasswordResetConfirm = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { passwordRequirements } = useFeatures();

  const [password, setPassword] = React.useState('');
  const [status, setStatus] = React.useState(Statuses.IDLE);
  const [hasValidPassword, setHasValidPassword] = React.useState<boolean>(passwordRequirements ? false : true);

  const isLoading = status === Statuses.LOADING;

  const handleSubmit: React.FormEventHandler = React.useCallback((event) => {
    event.preventDefault();

    setStatus(Statuses.LOADING);
    dispatch(resetPasswordConfirm(password, token as string))
      .then(() => setStatus(Statuses.SUCCESS))
      .catch(() => setStatus(Statuses.FAIL));
  }, [password]);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback((event) => {
    setPassword(event.target.value);
  }, []);

  const renderErrors = () => {
    if (status === Statuses.FAIL) {
      return [intl.formatMessage(messages.resetPasswordFail)];
    }

    return [];
  };

  if (status === Statuses.SUCCESS) {
    return <Redirect to='/' />;
  }

  return (
    <div>
      <div className='-mx-4 mb-4 border-b border-solid border-gray-200 pb-4 dark:border-gray-600 sm:-mx-10 sm:pb-10'>
        <h1 className='text-center text-2xl font-bold'>
          <FormattedMessage id='reset_password.header' defaultMessage='Set New Password' />
        </h1>
      </div>

      <div className='mx-auto sm:w-2/3 sm:pt-10 md:w-1/2'>
        <Form onSubmit={handleSubmit}>
          <FormGroup labelText={<FormattedMessage id='reset_password.password.label' defaultMessage='Password' />} errors={renderErrors()}>
            <Input
              type='password'
              name='password'
              placeholder={intl.formatMessage(messages.passwordPlaceholder)}
              onChange={onChange}
              required
            />

            {passwordRequirements && (
              <PasswordIndicator password={password} onChange={setHasValidPassword} />
            )}
          </FormGroup>

          <FormActions>
            <Button type='submit' theme='primary' disabled={isLoading || !hasValidPassword}>
              <FormattedMessage id='password_reset.reset' defaultMessage='Reset password' />
            </Button>
          </FormActions>
        </Form>
      </div>
    </div>
  );
};

export default PasswordResetConfirm;
