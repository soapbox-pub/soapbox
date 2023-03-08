import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Avatar, Divider, HStack, Stack, Text } from 'soapbox/components/ui';

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

      <Stack space={4}>
        <Text size='3xl' weight='bold' align='center'>
          <FormattedMessage id='manage_group.confirmation.title' defaultMessage='You’re all set!' />
        </Text>

        <Stack space={5}>
          <InfoListItem number={1}>
            <FormattedMessage
              id='manage_group.confirmation.info_1'
              defaultMessage='As the owner of this group, you can assign staff, delete posts and much more.'
            />
          </InfoListItem>

          <InfoListItem number={2}>
            <FormattedMessage
              id='manage_group.confirmation.info_2'
              defaultMessage="Post the group's first post and get the conversation started."
            />
          </InfoListItem>

          <InfoListItem number={3}>
            <FormattedMessage
              id='manage_group.confirmation.info_3'
              defaultMessage='Share your new group with friends, family and followers to grow its membership.'
            />
          </InfoListItem>
        </Stack>
      </Stack>
    </Stack>
  );
};

interface IInfoListNumber {
  number: number
}

const InfoListNumber: React.FC<IInfoListNumber> = ({ number }) => {
  return (
    <div className='flex h-7 w-7 items-center justify-center rounded-full border border-gray-200'>
      <Text theme='primary' size='sm' weight='bold'>{number}</Text>
    </div>
  );
};

interface IInfoListItem {
  number: number
  children: React.ReactNode
}

const InfoListItem: React.FC<IInfoListItem> = ({ number, children }) => {
  return (
    <HStack space={3}>
      <div><InfoListNumber number={number} /></div>
      <div>{children}</div>
    </HStack>
  );
};

export default ConfirmationStep;
