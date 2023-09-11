import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link, Redirect } from 'react-router-dom';

import { logIn, verifyCredentials } from 'soapbox/actions/auth';
import { fetchInstance } from 'soapbox/actions/instance';
import { openModal } from 'soapbox/actions/modals';
import SiteLogo from 'soapbox/components/site-logo';
import { Button, Form, HStack, IconButton, Input, Tooltip } from 'soapbox/components/ui';
import { useSoapboxConfig, useOwnAccount, useAppDispatch, useRegistrationStatus, useFeatures } from 'soapbox/hooks';

import Sonar from './sonar';

import type { AxiosError } from 'axios';

const messages = defineMessages({
  menu: { id: 'header.menu.title', defaultMessage: 'Open menu' },
  home: { id: 'header.home.label', defaultMessage: 'Home' },
  login: { id: 'header.login.label', defaultMessage: 'Log in' },
  register: { id: 'header.register.label', defaultMessage: 'Register' },
  username: { id: 'header.login.username.placeholder', defaultMessage: 'E-mail or username' },
  email: { id: 'header.login.email.placeholder', defaultMessage: 'E-mail address' },
  password: { id: 'header.login.password.label', defaultMessage: 'Password' },
  forgotPassword: { id: 'header.login.forgot_password', defaultMessage: 'Forgot password?' },
});

const Header = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();

  const { account } = useOwnAccount();
  const soapboxConfig = useSoapboxConfig();
  const { isOpen } = useRegistrationStatus();
  const { links } = soapboxConfig;

  const [isLoading, setLoading] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [shouldRedirect, setShouldRedirect] = React.useState(false);
  const [mfaToken, setMfaToken] = React.useState(false);

  const open = () => dispatch(openModal('LANDING_PAGE'));

  const handleSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    setLoading(true);

    dispatch(logIn(username, password) as any)
      .then(({ access_token }: { access_token: string }) => (
        dispatch(verifyCredentials(access_token) as any)
        // Refetch the instance for authenticated fetch
          .then(() => dispatch(fetchInstance()))
          .then(() => setShouldRedirect(true))
      ))
      .catch((error: AxiosError) => {
        setLoading(false);

        const data: any = error.response?.data;
        if (data?.error === 'mfa_required') {
          setMfaToken(data.mfa_token);
        }
      });
  };

  if (account && shouldRedirect) return <Redirect to='/' />;
  if (mfaToken) return <Redirect to={`/login?token=${encodeURIComponent(mfaToken)}`} />;

  return (
    <header data-testid='public-layout-header'>
      <nav className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8' aria-label='Header'>
        <div className='flex w-full items-center justify-between border-b border-indigo-500 py-6 lg:border-none'>
          <div className='relative flex w-36 items-center sm:justify-center'>
            <div className='absolute -left-6 -top-24 z-0 hidden md:block'>
              <Sonar />
            </div>

            <IconButton
              title={intl.formatMessage(messages.menu)}
              src={require('@tabler/icons/menu-2.svg')}
              onClick={open}
              className='mr-4 bg-transparent text-gray-700 hover:text-gray-600 dark:text-gray-600 md:hidden'
            />

            <Link to='/' className='z-10'>
              <SiteLogo alt='Logo' className='h-6 w-auto cursor-pointer' />
              <span className='hidden'>{intl.formatMessage(messages.home)}</span>
            </Link>

          </div>

          <HStack space={6} alignItems='center' className='relative z-10 ml-10'>
            <HStack alignItems='center'>
              <HStack space={6} alignItems='center' className='hidden md:mr-6 md:flex'>
                {links.get('help') && (
                  <a
                    href={links.get('help')}
                    target='_blank'
                    className='text-sm font-medium text-gray-700 hover:underline dark:text-gray-600'
                  >
                    <FormattedMessage id='landing_page_modal.helpCenter' defaultMessage='Help Center' />
                  </a>
                )}
              </HStack>

              <HStack space={2} className='shrink-0 xl:hidden'>
                <Button to='/login' theme='tertiary'>
                  {intl.formatMessage(messages.login)}
                </Button>

                {isOpen && (
                  <Button
                    to='/signup'
                    theme='primary'
                  >
                    {intl.formatMessage(messages.register)}
                  </Button>
                )}
              </HStack>
            </HStack>

            {features.nostrSignup ? (
              <div className='hidden xl:flex'>
                <Button
                  theme='primary'
                  type='submit'
                  disabled={isLoading}
                >
                  {intl.formatMessage(messages.login)}
                </Button>
              </div>
            ) : (
              <Form className='hidden items-center space-x-2 rtl:space-x-reverse xl:flex' onSubmit={handleSubmit}>
                <Input
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value.trim())}
                  type='text'
                  placeholder={intl.formatMessage(features.logInWithUsername ? messages.username : messages.email)}
                  className='max-w-[200px]'
                  autoCorrect='off'
                  autoCapitalize='off'
                />

                <Input
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type='password'
                  placeholder={intl.formatMessage(messages.password)}
                  className='max-w-[200px]'
                  autoComplete='off'
                  autoCorrect='off'
                  autoCapitalize='off'
                />

                <Link to='/reset-password'>
                  <Tooltip text={intl.formatMessage(messages.forgotPassword)}>
                    <IconButton
                      src={require('@tabler/icons/help.svg')}
                      className='cursor-pointer bg-transparent text-gray-700 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-500'
                      iconClassName='h-5 w-5'
                    />
                  </Tooltip>
                </Link>

                <Button
                  theme='primary'
                  type='submit'
                  disabled={isLoading}
                >
                  {intl.formatMessage(messages.login)}
                </Button>
              </Form>
            )}
          </HStack>
        </div>
      </nav>
    </header>
  );
};

export default Header;
