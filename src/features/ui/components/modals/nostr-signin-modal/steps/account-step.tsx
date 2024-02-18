import { NSchema as n } from 'nspec';
import React, { useMemo } from 'react';

import { useAccount } from 'soapbox/api/hooks';
import { Avatar, Text, Stack, Emoji, Button, Tooltip } from 'soapbox/components/ui';
import { useInstance } from 'soapbox/hooks';

interface IAccountStep {
  accountId: string;
}

const AccountStep: React.FC<IAccountStep> = ({ accountId }) => {
  const { account } = useAccount(accountId);
  const instance = useInstance();

  const isBech32 = useMemo(
    () => n.bech32().safeParse(account?.acct).success,
    [account?.acct],
  );

  if (!account) {
    return null;
  }

  return (
    <Stack space={6}>
      <Stack space={3} alignItems='center'>
        <Avatar className='bg-gray-100 dark:bg-gray-800' src={account.avatar} size={160} />

        <Stack space={1}>
          <Text
            size='xl'
            weight='semibold'
            align='center'
            dangerouslySetInnerHTML={{ __html: account.display_name_html }}
            truncate
          />

          <Tooltip text={account.nostr.npub ?? account.acct}>
            <Text size='sm' theme='muted' align='center' truncate>
              {isBech32 ? (
                account.acct.slice(0, 13)
              ) : (
                account.acct
              )}
            </Text>
          </Tooltip>
        </Stack>
      </Stack>

      {!account.ditto.is_registered && (
        <Stack space={6}>
          <Stack space={3} alignItems='center' className='rounded-xl bg-gray-100 p-4 dark:bg-gray-800'>
            <Emoji className='h-16 w-16' emoji='🫂' />

            <Text align='center' className='max-w-72'>
              You need an account on {instance.title} to continue.
            </Text>
          </Stack>

          <Button theme='accent' size='lg'>Join</Button>
        </Stack>
      )}
    </Stack>
  );
};

export default AccountStep;
