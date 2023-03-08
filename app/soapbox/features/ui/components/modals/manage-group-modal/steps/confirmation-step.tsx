import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Avatar, Divider, Stack, Text } from 'soapbox/components/ui';

interface IConfirmationStep {
  group: any
}

const ConfirmationStep: React.FC<IConfirmationStep> = ({ group }) => {
  return (
    <Stack space={9}>
      <Stack space={3}>
        <Stack>
          <label
            className='dark:sm:shadow-inset relative h-24 w-full cursor-pointer overflow-hidden rounded-lg bg-primary-100 text-primary-500 dark:bg-gray-800 dark:text-accent-blue sm:h-36 sm:shadow'
          >
            {group.header && <img className='h-full w-full object-cover' src={group.header} alt='' />}
          </label>

          <label className='mx-auto -mt-10 cursor-pointer rounded-full bg-primary-500 ring-2 ring-white dark:ring-primary-900'>
            {group.avatar && <Avatar src={group.avatar} size={80} />}
          </label>
        </Stack>

        <Stack>
          <Text size='2xl' weight='bold' align='center'>{group.display_name}</Text>
          <Text size='md' className='mx-auto max-w-sm'>{group.note}</Text>
        </Stack>
      </Stack>

      <Divider />

      <div>
        <Text size='3xl' weight='bold' align='center'>
          <FormattedMessage id='manage_group.confirmation.title' defaultMessage='You’re all set!' />
        </Text>
      </div>
    </Stack>
  );
};

export default ConfirmationStep;
