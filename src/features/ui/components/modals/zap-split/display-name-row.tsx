import React from 'react';

import { HStack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification-badge';
import { useSoapboxConfig } from 'soapbox/hooks';
import { getAcct } from 'soapbox/utils/accounts';

import type { Account } from 'soapbox/schemas';

interface IDisplayName {
  account: Pick<Account, 'id' | 'acct' | 'fqn' | 'verified' | 'display_name_html'>;
  withSuffix?: boolean;
}
/**
 * This component is different from other display name components because it displays the name inline.
 *
 * @param {IDisplayName} props - The properties for this component.
 * @param {Pick<Account, 'id' | 'acct' | 'fqn' | 'verified' | 'display_name_html'>} props.account - The account object contains all the metadata for an account, such as the display name, ID, and more.
 * @param {boolean} [props.withSuffix=true] - Determines whether to show the account suffix (eg, @danidfra).
 *
 * @returns {JSX.Element} The DisplayNameRow component.
 */
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

  // eslint-disable-next-line formatjs/no-literal-string-in-jsx
  const suffix = (<span className='display-name'>@{getAcct(account, displayFqn)}</span>);

  return (
    <div className='flex max-w-80 flex-col items-center justify-center text-center sm:flex-row sm:gap-2'>
      {displayName}
      {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
      <span className='hidden text-2xl font-bold sm:block'>-</span>
      {withSuffix && suffix}
    </div>
  );
};

export default DisplayNameRow;
