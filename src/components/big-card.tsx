import React from 'react';

import { Card, CardBody, Stack, Text } from 'soapbox/components/ui';
import IconButton from 'soapbox/components/ui/icon-button/icon-button';

const closeIcon = require('@tabler/icons/outline/x.svg');

interface IBigCard {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  onClose?(): void;
}

const BigCard: React.FC<IBigCard> = ({ title, subtitle, children, onClose }) => {
  return (
    <Card variant='rounded' size='xl'>
      <CardBody className='relative'>
        <div className='-mx-4 mb-4 border-b border-solid border-gray-200 pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
          <Stack space={2}>
            {onClose && (<IconButton src={closeIcon} className='absolute right-[2%]  text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 rtl:rotate-180' onClick={onClose} />)}
            <Text size='2xl' align='center' weight='bold'>{title}</Text>
            {subtitle && <Text theme='muted' align='center'>{subtitle}</Text>}
          </Stack>
        </div>

        <Stack space={5}>
          <div className='mx-auto sm:w-2/3 sm:pt-10'>
            {children}
          </div>
        </Stack>
      </CardBody>
    </Card>
  );
};

export { BigCard };