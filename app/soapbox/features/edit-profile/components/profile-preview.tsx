import React from 'react';

import StillImage from 'soapbox/components/still-image';
import { Avatar, HStack, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification-badge';
import { useSoapboxConfig } from 'soapbox/hooks';

import type { Account } from 'soapbox/types/entities';

interface IProfilePreview {
  account: Account
}

/** Displays a preview of the user's account, including avatar, banner, etc. */
const ProfilePreview: React.FC<IProfilePreview> = ({ account }) => {
  const { displayFqn } = useSoapboxConfig();

  return (
    <div className='dark:sm:shadow-inset overflow-hidden rounded-lg bg-white text-black dark:bg-gray-800 dark:text-white sm:shadow'>
      <div className='relative isolate h-32 w-full overflow-hidden bg-gray-200 dark:bg-gray-900/50 md:rounded-t-lg'>
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
