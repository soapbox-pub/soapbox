import React from 'react';

import { useSoapboxConfig } from 'soapbox/hooks';

import { getAcct } from '../utils/accounts';

import { HStack, Text } from './ui';
import VerificationBadge from './verification-badge';

import type { Account } from 'soapbox/schemas';

interface IDisplayName {
  account: Pick<Account, 'id' | 'acct' | 'fqn' | 'verified' | 'display_name_html'>;
  withSuffix?: boolean;
}

const DisplayNameRow: React.FC<IDisplayName> = ({ account, withSuffix = true }) => {
  const { displayFqn = false } = useSoapboxConfig();
  const { verified } = account;

  const displayName = (
    <HStack space={1} alignItems='center' justifyContent='center' grow>
      <Text
        size='sm'
        weight='normal'
        truncate
        dangerouslySetInnerHTML={{ __html: account.display_name_html }}
      />

      {verified && <VerificationBadge />}
    </HStack>
  );

  const suffix = (<span className='display-name'>@{getAcct(account, displayFqn)}</span>);

  return (
    <div className='flex max-w-80 flex-col items-center justify-center text-center sm:flex-row sm:gap-2'>
      {displayName}
      <span className='hidden text-2xl font-bold sm:block'>-</span>
      {withSuffix && suffix}
    </div>
  );
};

export default DisplayNameRow;
