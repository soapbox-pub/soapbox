import HStack from 'soapbox/components/ui/hstack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';

import { getAcct } from '../utils/accounts.ts';


import VerificationBadge from './verification-badge.tsx';

import type { Account } from 'soapbox/schemas/index.ts';

interface IDisplayName {
  account: Pick<Account, 'id' | 'acct' | 'fqn' | 'verified' | 'display_name_html'>;
  withSuffix?: boolean;
}

const DisplayNameInline: React.FC<IDisplayName> = ({ account, withSuffix = true }) => {
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

  // eslint-disable-next-line formatjs/no-literal-string-in-jsx
  const suffix = (<span className='relative block max-w-full truncate'>@{getAcct(account, displayFqn)}</span>);

  return (
    <div className='flex max-w-80 flex-col items-center justify-center text-center sm:flex-row sm:gap-2'>
      {displayName}
      <span className='hidden text-xl font-bold sm:block'>-</span> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
      {withSuffix && suffix}
    </div>
  );
};

export default DisplayNameInline;
