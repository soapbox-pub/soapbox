import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { Button, Form, FormActions, FormGroup, Input, Stack } from 'soapbox/components/ui';
import { useFeatures } from 'soapbox/hooks';

import ConsumersList from './consumers-list';

const messages = defineMessages({
  username: {
    id: 'login.fields.username_label',
    defaultMessage: 'E-mail or username',
  },
  email: {
    id: 'login.fields.email_label',
    defaultMessage: 'E-mail address',
  },
  password: {
    id: 'login.fields.password_placeholder',
    defaultMessage: 'Password',
  },
});

interface ILoginForm {
  isLoading: boolean
  handleSubmit: React.FormEventHandler
}

const LoginForm: React.FC<ILoginForm> = ({ isLoading, handleSubmit }) => {
  const intl = useIntl();
  const features = useFeatures();

  const usernameLabel = intl.formatMessage(features.logInWithUsername ? messages.username : messages.email);
  const passwordLabel = intl.formatMessage(messages.password);

  return (
    <div>
      <div className='-mx-4 mb-4 border-b border-solid border-gray-200 pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
        <h1 className='text-center text-2xl font-bold'><FormattedMessage id='login_form.header' defaultMessage='Sign In' /></h1>
      </div>

      <Stack className='mx-auto sm:w-2/3 sm:pt-10 md:w-1/2' space={5}>
        <Form onSubmit={handleSubmit}>
          <FormGroup labelText={usernameLabel}>
            <Input
              aria-label={usernameLabel}
              placeholder={usernameLabel}
              type='text'
              name='username'
              autoCorrect='off'
              autoCapitalize='off'
              required
            />
          </FormGroup>

          <FormGroup
            labelText={passwordLabel}
            hintText={
              <Link to='/reset-password' className='hover:underline' tabIndex={-1}>
                <FormattedMessage
                  id='login.reset_password_hint'
                  defaultMessage='Trouble logging in?'
                />
              </Link>
            }
          >
            <Input
              aria-label={passwordLabel}
              placeholder={passwordLabel}
              type='password'
              name='password'
              autoComplete='off'
              autoCorrect='off'
              autoCapitalize='off'
              required
            />
          </FormGroup>

          <FormActions>
            <Button
              theme='primary'
              type='submit'
              disabled={isLoading}
            >
              <FormattedMessage id='login.sign_in' defaultMessage='Sign in' />
            </Button>
          </FormActions>
        </Form>

        <ConsumersList />
      </Stack>
    </div>
  );
};

export default LoginForm;
