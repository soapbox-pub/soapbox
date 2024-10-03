import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Button, Icon, Stack, Text } from 'soapbox/components/ui';
import IconButton from 'soapbox/components/ui/icon-button/icon-button';

const closeIcon = require('@tabler/icons/outline/x.svg');

interface ICompletedModal {
  onClose?(): void;
  onComplete: () => void;
}

const CompletedModal: React.FC<ICompletedModal> = ({ onClose, onComplete }) => {
  return (

    <Stack space={4} justifyContent='center' alignItems='center' className='w-full rounded-3xl bg-white px-4 py-8 text-gray-900 shadow-lg black:bg-black sm:p-10 dark:bg-primary-900 dark:text-gray-100 dark:shadow-none'>

      <div className='relative w-full'>
        <IconButton src={closeIcon} className='absolute -right-2 -top-6 text-gray-500 hover:text-gray-700 sm:-right-4 rtl:rotate-180 dark:text-gray-300 dark:hover:text-gray-200' onClick={onClose} />
        <Stack space={2} justifyContent='center' alignItems='center' className=''>
          <Icon strokeWidth={1} src={require('@tabler/icons/outline/confetti.svg')} className='mx-auto h-16 w-16 text-primary-600 dark:text-primary-400' />
          <Text align='center' weight='bold' className='text-xl sm:text-2xl'>
            <FormattedMessage id='onboarding.finished.title' defaultMessage='Onboarding complete' />
          </Text>
          <Text theme='muted' align='center'>
            <FormattedMessage
              id='onboarding.finished.message'
              defaultMessage='We are very excited to welcome you to our community! Tap the button below to get started.'
            />
          </Text>
        </Stack>
      </div>

      <Stack justifyContent='center' alignItems='center' className='w-full'>
        <div className='w-2/3' />

        <Stack justifyContent='center' space={2} className='w-2/3'>
          <Button block theme='primary' onClick={onComplete}>
            <FormattedMessage id='onboarding.view_feed' defaultMessage='View Feed' />
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};


export default CompletedModal;