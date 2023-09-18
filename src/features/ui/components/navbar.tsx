import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link, Redirect } from 'react-router-dom';

import { logIn, verifyCredentials } from 'soapbox/actions/auth';
import { fetchInstance } from 'soapbox/actions/instance';
import { openSidebar } from 'soapbox/actions/sidebar';
import SiteLogo from 'soapbox/components/site-logo';
import { Avatar, Button, Form, HStack, IconButton, Input, Tooltip } from 'soapbox/components/ui';
import Search from 'soapbox/features/compose/components/search';
import { useAppDispatch, useFeatures, useOwnAccount, useRegistrationStatus } from 'soapbox/hooks';

import ProfileDropdown from './profile-dropdown';

import type { AxiosError } from 'axios';

const messages = defineMessages({
  login: { id: 'navbar.login.action', defaultMessage: 'Log in' },
  username: { id: 'navbar.login.username.placeholder', defaultMessage: 'E-mail or username' },
  email: { id: 'navbar.login.email.placeholder', defaultMessage: 'E-mail address' },
  password: { id: 'navbar.login.password.label', defaultMessage: 'Password' },
  forgotPassword: { id: 'navbar.login.forgot_password', defaultMessage: 'Forgot password?' },
});

const Navbar = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();
  const { isOpen } = useRegistrationStatus();
  const { account } = useOwnAccount();
  const node = useRef(null);

  const [isLoading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [mfaToken, setMfaToken] = useState<boolean>(false);

  const onOpenSidebar = () => dispatch(openSidebar());

  const handleSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    setLoading(true);

    dispatch(logIn(username, password) as any)
      .then(({ access_token }: { access_token: string }) => {
        setLoading(false);

        return (
          dispatch(verifyCredentials(access_token) as any)
            // Refetch the instance for authenticated fetch
            .then(() => dispatch(fetchInstance()))
        );
      })
      .catch((error: AxiosError) => {
        setLoading(false);

        const data: any = error.response?.data;
        if (data?.error === 'mfa_required') {
          setMfaToken(data.mfa_token);
        }
      });
  };

  if (mfaToken) return <Redirect to={`/login?token=${encodeURIComponent(mfaToken)}`} />;

  return (
    <nav className='sticky top-0 z-50 bg-white shadow dark:bg-primary-900' ref={node} data-testid='navbar'>
      <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
        <div className='relative flex h-12 justify-between lg:h-16'>
          {account && (
            <div className='absolute inset-y-0 left-0 flex items-center rtl:left-auto rtl:right-0 lg:hidden'>
              <button onClick={onOpenSidebar}>
                <Avatar src={account.avatar} size={34} />
              </button>
            </div>
          )}

          <HStack
            space={4}
            alignItems='center'
            className={clsx('enter flex-1 lg:items-stretch', {
              'justify-center lg:justify-start': account,
              'justify-start': !account,
            })}
          >
            <Link key='logo' to='/' data-preview-title-id='column.home' className='ml-4 flex shrink-0 items-center'>
              <SiteLogo alt='Logo' className='h-5 w-auto cursor-pointer' />
              <span className='hidden'><FormattedMessage id='tabs_bar.home' defaultMessage='Home' /></span>
            </Link>

            {account && (
              <div className='hidden flex-1 items-center justify-center px-2 lg:ml-6 lg:flex lg:justify-start'>
                <div className='hidden w-full max-w-xl lg:block lg:max-w-xs'>
                  <Search openInRoute autosuggest />
                </div>
              </div>
            )}
          </HStack>

          <HStack space={3} alignItems='center' className='absolute inset-y-0 right-0 pr-2 lg:static lg:inset-auto lg:ml-6 lg:pr-0'>
            {account ? (
              <div className='relative hidden items-center lg:flex'>
                <ProfileDropdown account={account}>
                  <Avatar src={account.avatar} size={34} />
                </ProfileDropdown>
              </div>
            ) : (
              <>
                <Form className='hidden items-center space-x-2 rtl:space-x-reverse lg:flex' onSubmit={handleSubmit}>
                  <Input
                    required
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    type='text'
                    placeholder={intl.formatMessage(features.logInWithUsername ? messages.username : messages.email)}
                    className='max-w-[200px]'
                  />

                  <Input
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type='password'
                    placeholder={intl.formatMessage(messages.password)}
                    className='max-w-[200px]'
                  />

                  <Link to='/reset-password'>
                    <Tooltip text={intl.formatMessage(messages.forgotPassword)}>
                      <IconButton
                        src={require('@tabler/icons/help.svg')}
                        className='cursor-pointer bg-transparent text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200'
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

                <div className='space-x-1.5 lg:hidden'>
                  <Button theme='tertiary' to='/login' size='sm'>
                    <FormattedMessage id='account.login' defaultMessage='Log In' />
                  </Button>

                  {isOpen && (
                    <Button theme='primary' to='/signup' size='sm'>
                      <FormattedMessage id='account.register' defaultMessage='Sign up' />
                    </Button>
                  )}
                </div>
              </>
            )}
          </HStack>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
