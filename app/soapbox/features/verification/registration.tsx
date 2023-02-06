import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { logIn, verifyCredentials } from 'soapbox/actions/auth';
import { fetchInstance } from 'soapbox/actions/instance';
import { startOnboarding } from 'soapbox/actions/onboarding';
import { createAccount, removeStoredVerification } from 'soapbox/actions/verification';
import { Button, Form, FormGroup, Input, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useInstance, useSoapboxConfig } from 'soapbox/hooks';
import toast from 'soapbox/toast';
import { getRedirectUrl } from 'soapbox/utils/redirect';

import PasswordIndicator from './components/password-indicator';

import type { AxiosError } from 'axios';

const messages = defineMessages({
  success: { id: 'registrations.success', defaultMessage: 'Welcome to {siteTitle}!' },
  usernameLabel: { id: 'registrations.username.label', defaultMessage: 'Your username' },
  usernameHint: { id: 'registrations.username.hint', defaultMessage: 'May only contain A-Z, 0-9, and underscores' },
  usernameTaken: { id: 'registrations.unprocessable_entity', defaultMessage: 'This username has already been taken.' },
  passwordLabel: { id: 'registrations.password.label', defaultMessage: 'Password' },
  error: { id: 'registrations.error', defaultMessage: 'Failed to register your account.' },
});

const initialState = {
  username: '',
  password: '',
};

const Registration = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const instance = useInstance();
  const soapboxConfig = useSoapboxConfig();
  const { links } = soapboxConfig;

  const isLoading = useAppSelector((state) => state.verification.isLoading as boolean);

  const [state, setState] = React.useState(initialState);
  const [shouldRedirect, setShouldRedirect] = React.useState<boolean>(false);
  const [hasValidPassword, setHasValidPassword] = React.useState<boolean>(false);
  const { username, password } = state;

  const handleSubmit: React.FormEventHandler = React.useCallback((event) => {
    event.preventDefault();

    dispatch(createAccount(username, password))
      .then(() => dispatch(logIn(username, password)))
      .then(({ access_token }: any) => dispatch(verifyCredentials(access_token)))
      .then(() => dispatch(fetchInstance()))
      .then(() => {
        setShouldRedirect(true);
        removeStoredVerification();
        dispatch(startOnboarding());
        toast.success(
          intl.formatMessage(messages.success, { siteTitle: instance.title }),
        );
      })
      .catch((errorResponse: AxiosError<{ error: string, message: string }>) => {
        const error = errorResponse.response?.data?.error;

        if (error) {
          toast.error(errorResponse.response?.data?.message || intl.formatMessage(messages.usernameTaken));
        } else {
          toast.error(intl.formatMessage(messages.error));
        }
      });
  }, [username, password]);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback((event) => {
    event.persist();

    setState((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
  }, []);

  if (shouldRedirect) {
    const redirectUri = getRedirectUrl();
    return <Redirect to={redirectUri} />;
  }

  return (
    <div>
      <div className='-mx-4 mb-4 border-b border-solid border-gray-200 pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
        <h1 className='text-center text-2xl font-bold'>
          <FormattedMessage id='registration.header' defaultMessage='Register your account' />
        </h1>
      </div>

      <div className='mx-auto space-y-4 sm:w-2/3 sm:pt-10 md:w-1/2'>
        <Form onSubmit={handleSubmit}>
          <FormGroup labelText={intl.formatMessage(messages.usernameLabel)} hintText={intl.formatMessage(messages.usernameHint)}>
            <Input
              name='username'
              type='text'
              value={username}
              onChange={handleInputChange}
              required
              icon={require('@tabler/icons/at.svg')}
              placeholder='LibertyForAll'
            />
          </FormGroup>

          <FormGroup labelText={intl.formatMessage(messages.passwordLabel)}>
            <Input
              name='password'
              type='password'
              value={password}
              onChange={handleInputChange}
              required
              data-testid='password-input'
            />

            <PasswordIndicator password={password} onChange={setHasValidPassword} />
          </FormGroup>

          <div className='space-y-2 text-center'>
            <Button
              block
              theme='primary'
              type='submit'
              disabled={isLoading || !hasValidPassword}
            >
              <FormattedMessage id='header.register.label' defaultMessage='Register' />
            </Button>

            {(links.get('termsOfService') && links.get('privacyPolicy')) ? (
              <Text theme='muted' size='xs'>
                <FormattedMessage
                  id='registration.acceptance'
                  defaultMessage='By registering, you agree to the {terms} and {privacy}.'
                  values={{
                    terms: (
                      <a href={links.get('termsOfService')} target='_blank' className='text-primary-600 hover:underline dark:text-primary-400'>
                        <FormattedMessage
                          id='registration.tos'
                          defaultMessage='Terms of Service'
                        />
                      </a>
                    ),
                    privacy: (
                      <a href={links.get('privacyPolicy')} target='_blank' className='text-primary-600 hover:underline dark:text-primary-400'>
                        <FormattedMessage
                          id='registration.privacy'
                          defaultMessage='Privacy Policy'
                        />
                      </a>
                    ),
                  }}
                />
              </Text>
            ) : null}
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Registration;
