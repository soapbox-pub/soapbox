import React from 'react';

import { Avatar, HStack, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification-badge';

interface IResults {
  accounts: {
    display_name: string
    acct: string
    id: string
    avatar: string
    verified: boolean
  }[]
  onSelect(id: string): void
}

const Results = ({ accounts, onSelect }: IResults) => (
  <>
    {(accounts || []).map((account: any) => (
      <button
        key={account.id}
        type='button'
        className='px-4 py-2 w-full flex flex-col hover:bg-gray-100 dark:hover:bg-gray-800'
        onClick={() => onSelect(account.id)}
        data-testid='account'
      >
        <HStack alignItems='center' space={2}>
          <Avatar src={account.avatar} size={40} />

          <Stack alignItems='start'>
            <div className='flex items-center space-x-1 flex-grow'>
              <Text weight='bold' size='sm' truncate>{account.display_name}</Text>
              {account.verified && <VerificationBadge />}
            </div>
            <Text size='sm' weight='medium' theme='muted' truncate>@{account.acct}</Text>
          </Stack>
        </HStack>
      </button>
    ))}
  </>
);

export default Results;