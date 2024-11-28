import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';


import { fetchPinnedAccounts } from 'soapbox/actions/accounts.ts';
import Widget from 'soapbox/components/ui/widget.tsx';
import AccountContainer from 'soapbox/containers/account-container.tsx';
import { WhoToFollowPanel } from 'soapbox/features/ui/util/async-components.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

import type { Account } from 'soapbox/schemas/index.ts';

interface IPinnedAccountsPanel {
  account: Account;
  limit: number;
}

const PinnedAccountsPanel: React.FC<IPinnedAccountsPanel> = ({ account, limit }) => {
  const dispatch = useAppDispatch();
  const pinned = useAppSelector((state) => state.user_lists.pinned.get(account.id)?.items || ImmutableOrderedSet<string>()).slice(0, limit);

  useEffect(() => {
    dispatch(fetchPinnedAccounts(account.id));
  }, []);

  if (pinned.isEmpty()) {
    return (
      <WhoToFollowPanel limit={limit} />
    );
  }

  return (
    <Widget
      title={<FormattedMessage
        id='pinned_accounts.title'
        defaultMessage='{name}’s choices'
        values={{
          name: account.display_name,
        }}
      />}
    >
      {pinned && pinned.map((suggestion) => (
        <AccountContainer
          key={suggestion}
          id={suggestion}
          withRelationship={false}
        />
      ))}
    </Widget>
  );
};

export default PinnedAccountsPanel;
