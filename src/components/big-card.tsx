import React from 'react';

import { Card, CardBody, Stack, Text } from 'soapbox/components/ui';

interface IBigCard {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

const BigCard: React.FC<IBigCard> = ({ title, subtitle, children }) => {
  return (
    <Card variant='rounded' size='xl'>
      <CardBody>
        <div className='-mx-4 mb-4 border-b border-solid border-gray-200 pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
          <Stack space={2}>
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