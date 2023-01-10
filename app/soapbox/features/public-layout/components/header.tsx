import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link, Redirect } from 'react-router-dom';

import { logIn, verifyCredentials } from 'soapbox/actions/auth';
import { fetchInstance } from 'soapbox/actions/instance';
import { openModal } from 'soapbox/actions/modals';
import SiteLogo from 'soapbox/components/site-logo';
import { Avatar, Button, Form, HStack, IconButton, Input, Tooltip } from 'soapbox/components/ui';
import ProfileDropdown from 'soapbox/features/ui/components/profile-dropdown';
import { useAppSelector, useFeatures, useSoapboxConfig, useOwnAccount, useInstance, useAppDispatch } from 'soapbox/hooks';

import Sonar from './sonar';

import type { AxiosError } from 'axios';

const messages = defineMessages({
  menu: { id: 'header.menu.title', defaultMessage: 'Open menu' },
  home: { id: 'header.home.label', defaultMessage: 'Home' },
  login: { id: 'header.login.label', defaultMessage: 'Log in' },
  register: { id: 'header.register.label', defaultMessage: 'Register' },
  username: { id: 'header.login.username.placeholder', defaultMessage: 'Email or username' },
  password: { id: 'header.login.password.label', defaultMessage: 'Password' },
  forgotPassword: { id: 'header.login.forgot_password', defaultMessage: 'Forgot password?' },
});

const Header = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const account = useOwnAccount();
  const soapboxConfig = useSoapboxConfig();
  const pepeEnabled = soapboxConfig.getIn(['extensions', 'pepe', 'enabled']) === true;
  const { links } = soapboxConfig;

  const features = useFeatures();
  const instance = useInstance();
  const isOpen = features.accountCreation && instance.registrations;
  const pepeOpen = useAppSelector(state => state.verification.instance.get('registrations') === true);

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
    <header>
      <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' aria-label='Header'>
        <div className='w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none'>
          <div className='flex items-center sm:justify-center relative w-36'>
            <div className='hidden md:block absolute z-0 -top-24 -left-6'>
              <Sonar />
            </div>

            <IconButton
              title={intl.formatMessage(messages.menu)}
              src={require('@tabler/icons/menu-2.svg')}
              onClick={open}
              className='md:hidden mr-4 bg-transparent text-gray-700 dark:text-gray-600 hover:text-gray-600'
            />

            <Link to='/' className='z-10'>
              <SiteLogo alt='Logo' className='h-6 w-auto cursor-pointer' />
              <span className='hidden'>{intl.formatMessage(messages.home)}</span>
            </Link>

          </div>

          <HStack space={6} alignItems='center' className='ml-10 relative z-10'>
            <HStack alignItems='center'>
              <HStack space={6} alignItems='center' className='hidden md:flex md:mr-6'>
                {links.get('help') && (
                  <a
                    href={links.get('help')}
                    target='_blank'
                    className='text-sm font-medium text-gray-700 dark:text-gray-600 hover:underline'
                  >
                    <FormattedMessage id='landing_page_modal.helpCenter' defaultMessage='Help Center' />
                  </a>
                )}
              </HStack>
              {(!account) && (
              <HStack space={2} className='xl:hidden shrink-0'>
                <Button to='/login' theme='tertiary'>
                  {intl.formatMessage(messages.login)}
                </Button>

                {(isOpen || pepeEnabled && pepeOpen) && (
                  <Button
                    to='/signup'
                    theme='primary'
                  >
                    {intl.formatMessage(messages.register)}
                  </Button>
                )}
              </HStack>
              )}
            </HStack>
            {account ? (
              <div className='hidden relative lg:flex items-center'>
                <ProfileDropdown account={account}>
                  <Avatar src={account.avatar} size={34} />
                </ProfileDropdown>
              </div>
            ) : (
              <>
            <Form className='hidden xl:flex space-x-2 rtl:space-x-reverse items-center' onSubmit={handleSubmit}>
              <Input
                required
                value={username}
                onChange={(event) => setUsername(event.target.value.trim())}
                type='text'
                placeholder={intl.formatMessage(messages.username)}
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
                    className='bg-transparent text-gray-700 dark:text-gray-600 hover:text-gray-800 dark:hover:text-gray-500 cursor-pointer'
                    iconClassName='w-5 h-5'
                    transparent
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
              </>
            )}
          </HStack>
        </div>
      </nav>
    </header>
  );
};

export default Header;
