import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import React, { useEffect } from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { fetchAccountFamiliarFollowers } from 'soapbox/actions/familiar-followers';
import { openModal } from 'soapbox/actions/modals';
import HoverRefWrapper from 'soapbox/components/hover-ref-wrapper';
import { Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification-badge';
import { useAppDispatch, useAppSelector, useFeatures } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';

import type { Account } from 'soapbox/types/entities';

const getAccount = makeGetAccount();

interface IProfileFamiliarFollowers {
  account: Account
}

const ProfileFamiliarFollowers: React.FC<IProfileFamiliarFollowers> = ({ account }) => {
  const dispatch = useAppDispatch();
  const me = useAppSelector((state) => state.me);
  const features = useFeatures();
  const familiarFollowerIds = useAppSelector(state => state.user_lists.familiar_followers.get(account.id)?.items || ImmutableOrderedSet<string>());
  const familiarFollowers: ImmutableOrderedSet<Account | null> = useAppSelector(state => familiarFollowerIds.slice(0, 2).map(accountId => getAccount(state, accountId)));

  useEffect(() => {
    if (me && features.familiarFollowers) {
      dispatch(fetchAccountFamiliarFollowers(account.id));
    }
  }, []);

  const openFamiliarFollowersModal = () => {
    dispatch(openModal('FAMILIAR_FOLLOWERS', {
      accountId: account.id,
    }));
  };

  if (familiarFollowerIds.size === 0) {
    return null;
  }

  const accounts: Array<React.ReactNode> = familiarFollowers.map(account => !!account && (
    <HoverRefWrapper accountId={account.id} inline>
      <Link className='mention' to={`/@${account.acct}`}>
        <span dangerouslySetInnerHTML={{ __html: account.display_name_html }} />

        {account.verified && <VerificationBadge />}
      </Link>
    </HoverRefWrapper>
  )).toArray();

  if (familiarFollowerIds.size > 2) {
    accounts.push(
      <span className='cursor-pointer hover:underline' role='presentation' onClick={openFamiliarFollowersModal}>
        <FormattedMessage
          id='account.familiar_followers.more'
          defaultMessage='{count, plural, one {# other} other {# others}} you follow'
          values={{ count: familiarFollowerIds.size - familiarFollowers.size }}
        />
      </span>,
    );
  }

  return (
    <Text theme='muted' size='sm'>
      <FormattedMessage
        id='account.familiar_followers'
        defaultMessage='Followed by {accounts}'
        values={{
          accounts: <FormattedList type='conjunction' value={accounts} />,
        }}
      />
    </Text>
  );
};

export default ProfileFamiliarFollowers;
