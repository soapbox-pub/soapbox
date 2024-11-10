import HoverRefWrapper from 'soapbox/components/hover-ref-wrapper.tsx';
import { useSoapboxConfig } from 'soapbox/hooks/index.ts';

import { getAcct } from '../utils/accounts.ts';

import { HStack, Text } from './ui/index.ts';
import VerificationBadge from './verification-badge.tsx';

import type { Account } from 'soapbox/schemas/index.ts';

interface IDisplayName {
  account: Pick<Account, 'id' | 'acct' | 'fqn' | 'verified' | 'display_name_html'>;
  withSuffix?: boolean;
  children?: React.ReactNode;
}

const DisplayName: React.FC<IDisplayName> = ({ account, children, withSuffix = true }) => {
  const { displayFqn = false } = useSoapboxConfig();
  const { verified } = account;

  const displayName = (
    <HStack space={1} alignItems='center' grow>
      <Text
        size='sm'
        weight='semibold'
        truncate
        dangerouslySetInnerHTML={{ __html: account.display_name_html }}
      />

      {verified && <VerificationBadge />}
    </HStack>
  );

  const suffix = (<span className='display-name__account'>@{getAcct(account, displayFqn)}</span>); // eslint-disable-line formatjs/no-literal-string-in-jsx

  return (
    <span className='display-name' data-testid='display-name'>
      <HoverRefWrapper accountId={account.id} inline>
        {displayName}
      </HoverRefWrapper>
      {withSuffix && suffix}
      {children}
    </span>
  );
};

export default DisplayName;
