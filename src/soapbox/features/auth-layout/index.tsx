import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link, Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';

import LandingGradient from 'soapbox/components/landing-gradient';
import SiteLogo from 'soapbox/components/site-logo';
import { useOwnAccount, useInstance, useRegistrationStatus } from 'soapbox/hooks';

import { Button, Card, CardBody } from '../../components/ui';
import LoginPage from '../auth-login/components/login-page';
import PasswordReset from '../auth-login/components/password-reset';
import PasswordResetConfirm from '../auth-login/components/password-reset-confirm';
import RegistrationForm from '../auth-login/components/registration-form';
import ExternalLoginForm from '../external-login/components/external-login-form';
import Footer from '../public-layout/components/footer';
import RegisterInvite from '../register-invite';
import Verification from '../verification';
import EmailPassthru from '../verification/email-passthru';

const messages = defineMessages({
  register: { id: 'auth_layout.register', defaultMessage: 'Create an account' },
});

const AuthLayout = () => {
  const intl = useIntl();
  const history = useHistory();
  const { search } = useLocation();

  const { account } = useOwnAccount();
  const instance = useInstance();
  const { isOpen } = useRegistrationStatus();
  const isLoginPage = history.location.pathname === '/login';

  return (
    <div className='h-full'>
      <LandingGradient />

      <main className='relative h-full sm:flex sm:justify-center'>
        <div className='flex h-full w-full flex-col sm:max-w-lg md:max-w-2xl lg:max-w-6xl'>
          <header className='relative mb-auto flex justify-between px-2 py-12'>
            <div className='relative z-0 flex-1 px-2 lg:absolute lg:inset-0 lg:flex lg:items-center lg:justify-center'>
              <Link to='/' className='cursor-pointer'>
                <SiteLogo alt={instance.title} className='h-7' />
              </Link>
            </div>

            {(isLoginPage && isOpen) && (
              <div className='relative z-10 ml-auto flex items-center'>
                <Button
                  theme='tertiary'
                  icon={require('@tabler/icons/user.svg')}
                  to='/signup'
                >
                  {intl.formatMessage(messages.register)}
                </Button>
              </div>
            )}
          </header>

          <div className='flex flex-col items-center justify-center'>
            <div className='w-full pb-10 sm:mx-auto sm:max-w-lg md:max-w-2xl'>
              <Card variant='rounded' size='xl'>
                <CardBody>
                  <Switch>
                    {/* If already logged in, redirect home. */}
                    {account && <Redirect from='/login' to='/' exact />}

                    <Route exact path='/verify' component={Verification} />
                    <Route exact path='/verify/email/:token' component={EmailPassthru} />
                    <Route exact path='/login/external' component={ExternalLoginForm} />
                    <Route exact path='/login/add' component={LoginPage} />
                    <Route exact path='/login' component={LoginPage} />
                    <Route exact path='/signup' component={RegistrationForm} />
                    <Route exact path='/reset-password' component={PasswordReset} />
                    <Route exact path='/edit-password' component={PasswordResetConfirm} />
                    <Route path='/invite/:token' component={RegisterInvite} />

                    <Redirect from='/auth/password/new' to='/reset-password' />
                    <Redirect from='/auth/password/edit' to={`/edit-password${search}`} />
                  </Switch>
                </CardBody>
              </Card>
            </div>
          </div>

          <div className='mt-auto'>
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
