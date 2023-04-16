import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { resetPassword } from 'soapbox/actions/security';
import { Button, Form, FormActions, FormGroup, Input } from 'soapbox/components/ui';
import { useAppDispatch, useFeatures } from 'soapbox/hooks';
import toast from 'soapbox/toast';

const messages = defineMessages({
  nicknameOrEmail: { id: 'password_reset.fields.username_placeholder', defaultMessage: 'E-mail or username' },
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
    <div>
      <div className='-mx-4 mb-4 border-b border-solid border-gray-200 pb-4 dark:border-gray-600 sm:-mx-10 sm:pb-10'>
        <h1 className='text-center text-2xl font-bold'>
          <FormattedMessage id='password_reset.header' defaultMessage='Reset Password' />
        </h1>
      </div>

      <div className='mx-auto sm:w-2/3 sm:pt-10 md:w-1/2'>
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
      </div>
    </div>
  );
};

export default PasswordReset;
