import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Text, Button, Modal, Stack, HStack } from 'soapbox/components/ui';
import { useAppSelector, useSoapboxConfig } from 'soapbox/hooks';
import { usePendingPolicy, useAcceptPolicy } from 'soapbox/queries/policies';

interface IPolicyModal {
  onClose: (type: string) => void
}

const DirectMessageUpdates = () => {
  const soapboxConfig = useSoapboxConfig();
  const { links } = soapboxConfig;

  return (
    <Stack space={3}>
      <Stack space={4} className='rounded-lg border-2 border-solid border-primary-200 p-4 dark:border-primary-800'>
        <HStack alignItems='center' space={3}>
          <svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M0 22.5306C0 10.0873 10.0873 0 22.5306 0H26.4828C38.3664 0 48 9.6336 48 21.5172V21.5172C48 36.1433 36.1433 48 21.5172 48H18.4615C8.26551 48 0 39.7345 0 29.5385V22.5306Z' fill='url(#paint0_linear_2190_131524)' fillOpacity='0.2' />
            <path fillRule='evenodd' clipRule='evenodd' d='M14.0001 19C14.0001 17.3431 15.3433 16 17.0001 16H31.0001C32.657 16 34.0001 17.3431 34.0001 19V19.9845C34.0002 19.9942 34.0002 20.004 34.0001 20.0137V29C34.0001 30.6569 32.657 32 31.0001 32H17.0001C15.3433 32 14.0001 30.6569 14.0001 29V20.0137C14 20.004 14 19.9942 14.0001 19.9845V19ZM16.0001 21.8685V29C16.0001 29.5523 16.4478 30 17.0001 30H31.0001C31.5524 30 32.0001 29.5523 32.0001 29V21.8685L25.6642 26.0925C24.6565 26.7642 23.3437 26.7642 22.336 26.0925L16.0001 21.8685ZM32.0001 19.4648L24.5548 24.4283C24.2189 24.6523 23.7813 24.6523 23.4454 24.4283L16.0001 19.4648V19C16.0001 18.4477 16.4478 18 17.0001 18H31.0001C31.5524 18 32.0001 18.4477 32.0001 19V19.4648Z' fill='#818CF8' />
            <defs>
              <linearGradient id='paint0_linear_2190_131524' x1='0' y1='0' x2='43.6184' y2='-3.69691' gradientUnits='userSpaceOnUse'>
                <stop stopColor='#B8A3F9' />
                <stop offset='1' stopColor='#9BD5FF' />
              </linearGradient>
            </defs>
          </svg>

          <Text weight='bold'>
            Direct Messaging
          </Text>
        </HStack>

        <Text theme='muted'>
          Yes, direct messages are finally here!
        </Text>

        <Text theme='muted'>
          Bring one-on-one conversations from your Feed to your DMs with
          messages that automatically delete for your privacy.
        </Text>
      </Stack>

      <Stack space={4} className='rounded-lg border-2 border-solid border-primary-200 p-4 dark:border-primary-800'>
        <HStack alignItems='center' space={3}>
          <svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M0 25.7561C0 22.2672 0 20.5228 0.197492 19.0588C1.52172 9.24259 9.24259 1.52172 19.0588 0.197492C20.5228 0 22.2672 0 25.7561 0H30.1176C39.9938 0 48 8.0062 48 17.8824C48 34.5159 34.5159 48 17.8824 48H15.3192C15.0228 48 14.8747 48 14.7494 47.9979C6.66132 47.8627 0.137263 41.3387 0.0020943 33.2506C0 33.1253 0 32.9772 0 32.6808V25.7561Z' fill='url(#paint0_linear_2190_131532)' fillOpacity='0.2' />
            <path fillRule='evenodd' clipRule='evenodd' d='M23.9999 14C24.5522 14 24.9999 14.4477 24.9999 15V16C24.9999 16.5523 24.5522 17 23.9999 17C23.4477 17 22.9999 16.5523 22.9999 16V15C22.9999 14.4477 23.4477 14 23.9999 14ZM16.9289 16.9289C17.3194 16.5384 17.9526 16.5384 18.3431 16.9289L19.0502 17.636C19.4407 18.0266 19.4407 18.6597 19.0502 19.0503C18.6597 19.4408 18.0265 19.4408 17.636 19.0503L16.9289 18.3431C16.5384 17.9526 16.5384 17.3195 16.9289 16.9289ZM31.071 16.9289C31.4615 17.3195 31.4615 17.9526 31.071 18.3431L30.3639 19.0503C29.9734 19.4408 29.3402 19.4408 28.9497 19.0503C28.5592 18.6597 28.5592 18.0266 28.9497 17.636L29.6568 16.9289C30.0473 16.5384 30.6805 16.5384 31.071 16.9289ZM21.1715 21.1716C19.6094 22.7337 19.6094 25.2664 21.1715 26.8285L21.7186 27.3755C21.9116 27.5686 22.0848 27.7778 22.2367 28H25.7632C25.9151 27.7778 26.0882 27.5686 26.2813 27.3755L26.8284 26.8285C28.3905 25.2664 28.3905 22.7337 26.8284 21.1716C25.2663 19.6095 22.7336 19.6095 21.1715 21.1716ZM27.2448 29.4187C27.3586 29.188 27.5101 28.9751 27.6955 28.7898L28.2426 28.2427C30.5857 25.8995 30.5857 22.1005 28.2426 19.7574C25.8994 17.4142 22.1005 17.4142 19.7573 19.7574C17.4142 22.1005 17.4142 25.8995 19.7573 28.2427L20.3044 28.7898C20.4898 28.9751 20.6413 29.188 20.7551 29.4187C20.7601 29.4295 20.7653 29.4403 20.7706 29.4509C20.9202 29.7661 20.9999 30.1134 20.9999 30.469V31C20.9999 32.6569 22.3431 34 23.9999 34C25.6568 34 26.9999 32.6569 26.9999 31V30.469C26.9999 30.1134 27.0797 29.7661 27.2292 29.4509C27.2346 29.4403 27.2398 29.4295 27.2448 29.4187ZM25.0251 30H22.9748C22.9915 30.155 22.9999 30.3116 22.9999 30.469V31C22.9999 31.5523 23.4477 32 23.9999 32C24.5522 32 24.9999 31.5523 24.9999 31V30.469C24.9999 30.3116 25.0084 30.155 25.0251 30ZM14 23.9999C14 23.4477 14.4477 22.9999 15 22.9999H16C16.5523 22.9999 17 23.4477 17 23.9999C17 24.5522 16.5523 24.9999 16 24.9999H15C14.4477 24.9999 14 24.5522 14 23.9999ZM31 23.9999C31 23.4477 31.4477 22.9999 32 22.9999H33C33.5523 22.9999 34 23.4477 34 23.9999C34 24.5522 33.5523 24.9999 33 24.9999H32C31.4477 24.9999 31 24.5522 31 23.9999Z' fill='#818CF8' />
            <defs>
              <linearGradient id='paint0_linear_2190_131532' x1='0' y1='0' x2='43.6184' y2='-3.69691' gradientUnits='userSpaceOnUse'>
                <stop stopColor='#B8A3F9' />
                <stop offset='1' stopColor='#9BD5FF' />
              </linearGradient>
            </defs>
          </svg>

          <Text weight='bold'>Privacy Policy Updates</Text>
        </HStack>

        <ul className='space-y-2'>
          <li className='flex items-center space-x-2'>
            <span className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-solid border-gray-200 text-sm font-bold text-primary-500 dark:border-gray-800 dark:text-primary-300'>
              1
            </span>

            <Text theme='muted'>Consolidates previously-separate policies</Text>
          </li>
          <li className='flex items-center space-x-2'>
            <span className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-solid border-gray-200 text-sm font-bold text-primary-500 dark:border-gray-800 dark:text-primary-300'>
              2
            </span>

            <Text theme='muted'>Reaffirms jurisdiction-specific requirements</Text>
          </li>
          <li className='flex items-center space-x-2'>
            <span className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-solid border-gray-200 text-sm font-bold text-primary-500 dark:border-gray-800 dark:text-primary-300'>
              3
            </span>

            <Text theme='muted'>Introduces updates regarding ads and direct messages</Text>
          </li>
        </ul>

        {links.get('privacyPolicy') ? (
          <a
            className='text-center font-bold text-primary-600 hover:underline dark:text-accent-blue'
            href={links.get('privacyPolicy')}
            target='_blank'
          >
            View Privacy Policy
          </a>
        ) : null}
      </Stack>
    </Stack>
  );
};

const supportedPolicyIds = ['1'];

/** Modal to show privacy policy changes that need confirmation. */
const PolicyModal: React.FC<IPolicyModal> = ({ onClose }) => {
  const acceptPolicy = useAcceptPolicy();
  const instance = useAppSelector((state) => state.instance);

  const { data: pendingPolicy, isLoading } = usePendingPolicy();

  const renderPolicyBody = () => {
    switch (pendingPolicy?.pending_policy_id) {
      case '1':
        return <DirectMessageUpdates />;
      default:
        return null;
    }
  };

  const handleAccept = () => {
    acceptPolicy.mutate({
      policy_id: pendingPolicy?.pending_policy_id as string,
    }, {
      onSuccess() {
        onClose('POLICY');
      },
    });
  };

  if (isLoading || !pendingPolicy) {
    return null;
  }

  return (
    <Modal title='Updates'>
      <Stack space={4}>
        <Text theme='muted'>
          <FormattedMessage
            id='modals.policy.updateTitle'
            defaultMessage='You’ve scored the latest version of {siteTitle}! Take a moment to review the exciting new things we’ve been working on.'
            values={{ siteTitle: instance.title }}
          />
        </Text>

        {renderPolicyBody()}

        <Button
          theme='primary'
          size='lg'
          block
          onClick={handleAccept}
          disabled={acceptPolicy.isLoading}
        >
          <FormattedMessage
            id='modals.policy.submit'
            defaultMessage='Accept & Continue'
          />
        </Button>
      </Stack>
    </Modal>
  );
};

export { PolicyModal as default, supportedPolicyIds };
