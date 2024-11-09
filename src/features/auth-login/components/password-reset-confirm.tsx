import { useCallback, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { resetPasswordConfirm } from 'soapbox/actions/security';
import { BigCard } from 'soapbox/components/big-card';
import { Button, Form, FormActions, FormGroup, Input } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

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

  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(Statuses.IDLE);

  const isLoading = status === Statuses.LOADING;

  const handleSubmit: React.FormEventHandler = useCallback((event) => {
    event.preventDefault();

    setStatus(Statuses.LOADING);
    dispatch(resetPasswordConfirm(password, token as string))
      .then(() => setStatus(Statuses.SUCCESS))
      .catch(() => setStatus(Statuses.FAIL));
  }, [password]);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
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
    <BigCard title={<FormattedMessage id='reset_password.header' defaultMessage='Set New Password' />}>
      <Form onSubmit={handleSubmit}>
        <FormGroup labelText={<FormattedMessage id='reset_password.password.label' defaultMessage='Password' />} errors={renderErrors()}>
          <Input
            type='password'
            name='password'
            placeholder={intl.formatMessage(messages.passwordPlaceholder)}
            onChange={onChange}
            required
          />
        </FormGroup>

        <FormActions>
          <Button type='submit' theme='primary' disabled={isLoading}>
            <FormattedMessage id='password_reset.reset' defaultMessage='Reset password' />
          </Button>
        </FormActions>
      </Form>
    </BigCard>
  );
};

export default PasswordResetConfirm;
