import React from 'react';

import StillImage from 'soapbox/components/still-image';
import { Avatar, HStack, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification-badge';
import { useSoapboxConfig } from 'soapbox/hooks';

import type { Account } from 'soapbox/types/entities';

interface IProfilePreview {
  account: Account,
}

/** Displays a preview of the user's account, including avatar, banner, etc. */
const ProfilePreview: React.FC<IProfilePreview> = ({ account }) => {
  const { displayFqn } = useSoapboxConfig();

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg text-black dark:text-white sm:shadow dark:sm:shadow-inset overflow-hidden'>
      <div className='relative overflow-hidden isolate w-full h-32 md:rounded-t-lg bg-gray-200 dark:bg-gray-900/50'>
        <StillImage src={account.header} />
      </div>

      <HStack space={3} alignItems='center' className='p-3'>
        <div className='relative'>
          <Avatar className='bg-gray-400' src={account.avatar} />

          {account.verified && (
            <div className='absolute -top-1.5 -right-1.5'>
              <VerificationBadge />
            </div>
          )}
        </div>

        <Stack className='truncate'>
          <Text
            weight='medium'
            size='sm'
            truncate
            dangerouslySetInnerHTML={{ __html: account.display_name_html }}
          />
          <Text theme='muted' size='sm'>@{displayFqn ? account.fqn : account.acct}</Text>
        </Stack>
      </HStack>
    </div>
  );
};

export default ProfilePreview;
