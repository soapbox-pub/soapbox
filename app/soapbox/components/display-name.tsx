import React from 'react';

import HoverRefWrapper from 'soapbox/components/hover-ref-wrapper';
import { useSoapboxConfig } from 'soapbox/hooks';

import { getAcct } from '../utils/accounts';

import Icon from './icon';
import RelativeTimestamp from './relative-timestamp';
import { HStack, Text } from './ui';
import VerificationBadge from './verification-badge';

import type { Account } from 'soapbox/types/entities';

interface IDisplayName {
  account: Account
  withSuffix?: boolean
  withDate?: boolean
  children?: React.ReactNode
}

const DisplayName: React.FC<IDisplayName> = ({ account, children, withSuffix = true, withDate = false }) => {
  const { displayFqn = false } = useSoapboxConfig();
  const { created_at: createdAt, verified } = account;

  const joinedAt = createdAt ? (
    <div className='account__joined-at'>
      <Icon src={require('@tabler/icons/clock.svg')} />
      <RelativeTimestamp timestamp={createdAt} />
    </div>
  ) : null;

  const displayName = (
    <HStack space={1} alignItems='center' grow>
      <Text
        size='sm'
        weight='semibold'
        truncate
        dangerouslySetInnerHTML={{ __html: account.display_name_html }}
      />

      {verified && <VerificationBadge />}
      {withDate && joinedAt}
    </HStack>
  );

  const suffix = (<span className='display-name__account'>@{getAcct(account, displayFqn)}</span>);

  return (
    <span className='display-name' data-testid='display-name'>
      <HoverRefWrapper accountId={account.get('id')} inline>
        {displayName}
      </HoverRefWrapper>
      {withSuffix && suffix}
      {children}
    </span>
  );
};

export default DisplayName;
