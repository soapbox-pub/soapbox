import HoverRefWrapper from '@/components/hover-ref-wrapper.tsx';
import HStack from '@/components/ui/hstack.tsx';
import Text from '@/components/ui/text.tsx';
import { useSoapboxConfig } from '@/hooks/useSoapboxConfig.ts';
import { getAcct } from '@/utils/accounts.ts';
import { emojifyText } from '@/utils/emojify.tsx';

import VerificationBadge from './verification-badge.tsx';

import type { Account } from '@/schemas/index.ts';

interface IDisplayName {
  account: Pick<Account, 'id' | 'acct' | 'emojis' | 'fqn' | 'verified' | 'display_name'>;
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
      >
        {emojifyText(account.display_name, account.emojis)}
      </Text>

      {verified && <VerificationBadge />}
    </HStack>
  );

  const suffix = (<span className='relative text-[14px] font-semibold'>@{getAcct(account, displayFqn)}</span>); // eslint-disable-line formatjs/no-literal-string-in-jsx

  return (
    <span className='relative block max-w-full truncate' data-testid='display-name'>
      <HoverRefWrapper accountId={account.id} inline>
        {displayName}
      </HoverRefWrapper>
      {withSuffix && suffix}
      {children}
    </span>
  );
};

export default DisplayName;
