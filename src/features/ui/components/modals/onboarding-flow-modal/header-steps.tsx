import React from 'react';

import { Stack, Text } from 'soapbox/components/ui';
import IconButton from 'soapbox/components/ui/icon-button/icon-button';

interface IHeaderSteps {
  onClose?: () => void;
  title: React.ReactNode;
  subtitle: React.ReactNode;
}

export const HeaderSteps = ({ onClose, title, subtitle }: IHeaderSteps) => {
  return (
    <div className='w-5/6 sm:w-full'>
      <IconButton src={require('@tabler/icons/outline/x.svg')} onClick={onClose} className='absolute right-2 top-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 sm:right-6 sm:top-5 rtl:rotate-180' />
      <Stack space={2} justifyContent='center' alignItems='center' className='bg-grey-500 border-grey-200 -mx-4 mb-4 border-b border-solid pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
        <Text align='center' weight='bold' className='text-xl sm:text-2xl'>
          {title}
        </Text>
        <Text theme='muted' align='center'>
          {subtitle}
        </Text>
      </Stack>
    </div>
  );
};
