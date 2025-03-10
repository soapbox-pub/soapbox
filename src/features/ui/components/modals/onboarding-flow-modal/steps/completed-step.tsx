import confettiIcon from '@tabler/icons/outline/confetti.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import { FormattedMessage } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';

const closeIcon = xIcon;

interface ICompletedModal {
  onClose?(): void;
  onComplete: () => void;
}

const CompletedModal: React.FC<ICompletedModal> = ({ onClose, onComplete }) => {
  return (

    <Stack space={4} justifyContent='center' alignItems='center' className='w-full rounded-3xl bg-white px-4 py-8 text-gray-900 shadow-lg black:bg-black dark:bg-primary-900 dark:text-gray-100 dark:shadow-none sm:p-10'>

      <div className='relative w-full'>
        <IconButton src={closeIcon} className='absolute -right-2 -top-6 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 sm:-right-4 rtl:rotate-180' onClick={onClose} />
        <Stack space={2} justifyContent='center' alignItems='center' className=''>
          <Icon strokeWidth={1} src={confettiIcon} className='mx-auto size-16 text-primary-600 dark:text-primary-400' />
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