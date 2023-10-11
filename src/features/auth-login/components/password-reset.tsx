import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { resetPassword } from 'soapbox/actions/security';
import { BigCard } from 'soapbox/components/big-card';
import { Button, Form, FormActions, FormGroup, Input } from 'soapbox/components/ui';
import { useAppDispatch, useFeatures } from 'soapbox/hooks';
import toast from 'soapbox/toast';

const messages = defineMessages({
  nicknameOrEmail: { id: 'password_reset.fields.username_placeholder', defaultMessage: 'Email or username' },
  email: { id: 'password_reset.fields.email_placeholder', defaultMessage: 'E-mail address' },
  confirmation: { id: 'password_reset.confirmation', defaultMessage: 'Check your email for confirmation.' },
});

const PasswordReset = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<Element>) => {
    const nicknameOrEmail = (e.target as any).nickname_or_email.value;
    setIsLoading(true);
    dispatch(resetPassword(nicknameOrEmail)).then(() => {
      setIsLoading(false);
      setSuccess(true);
      toast.info(intl.formatMessage(messages.confirmation));
    }).catch(() => {
      setIsLoading(false);
    });
  };

  if (success) return <Redirect to='/' />;

  return (
    <BigCard title={<FormattedMessage id='password_reset.header' defaultMessage='Reset Password' />}>
      <Form onSubmit={handleSubmit}>
        <FormGroup labelText={intl.formatMessage(features.logInWithUsername ? messages.nicknameOrEmail : messages.email)}>
          <Input
            type='text'
            name='nickname_or_email'
            placeholder='me@example.com'
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

export default PasswordReset;
