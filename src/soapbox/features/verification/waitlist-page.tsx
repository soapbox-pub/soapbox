import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { logOut } from 'soapbox/actions/auth';
import { openModal } from 'soapbox/actions/modals';
import LandingGradient from 'soapbox/components/landing-gradient';
import SiteLogo from 'soapbox/components/site-logo';
import { Button, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useInstance, useOwnAccount } from 'soapbox/hooks';

const WaitlistPage = () => {
  const dispatch = useAppDispatch();
  const instance = useInstance();

  const { account: me } = useOwnAccount();
  const isSmsVerified = me?.source?.sms_verified ?? true;

  const onClickLogOut: React.MouseEventHandler = (event) => {
    event.preventDefault();
    dispatch(logOut());
  };

  const openVerifySmsModal = () => dispatch(openModal('VERIFY_SMS'));

  useEffect(() => {
    if (!isSmsVerified) {
      openVerifySmsModal();
    }
  }, []);

  return (
    <div>
      <LandingGradient />

      <main className='relative mx-auto flex h-screen max-w-7xl flex-col px-2 sm:px-6 lg:px-8'>
        <header className='relative flex h-16 justify-between'>
          <div className='relative flex flex-1 items-stretch justify-center'>
            <Link to='/' className='flex shrink-0 cursor-pointer items-center'>
              <SiteLogo alt='Logo' className='h-7' />
            </Link>

            <div className='absolute inset-y-0 right-0 flex items-center pr-2'>
              <Button onClick={onClickLogOut} theme='primary' to='/logout'>
                <FormattedMessage id='navigation_bar.logout' defaultMessage='Logout' />
              </Button>
            </div>
          </div>
        </header>

        <div className='-mt-16 flex h-full flex-col items-center justify-center'>
          <div className='max-w-xl'>
            <Stack space={4}>
              <img src='/instance/images/waitlist.png' className='mx-auto h-32 w-32' alt='Waitlisted' />

              <Stack space={2}>
                <Text size='lg' theme='muted' align='center' weight='medium'>
                  <FormattedMessage
                    id='waitlist.body'
                    defaultMessage='Welcome back to {title}! You were previously placed on our waitlist. Please verify your phone number to receive immediate access to your account!'
                    values={{ title: instance.title }}
                  />
                </Text>

                <div className='text-center'>
                  <Button onClick={openVerifySmsModal} theme='primary'>
                    <FormattedMessage id='waitlist.actions.verify_number' defaultMessage='Verify phone number' />
                  </Button>
                </div>
              </Stack>
            </Stack>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WaitlistPage;
