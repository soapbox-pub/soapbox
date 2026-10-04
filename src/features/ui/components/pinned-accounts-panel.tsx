import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';


import { fetchPinnedAccounts } from '@/actions/accounts.ts';
import Widget from '@/components/ui/widget.tsx';
import AccountContainer from '@/containers/account-container.tsx';
import { WhoToFollowPanel } from '@/features/ui/util/async-components.ts';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';

import type { Account } from '@/schemas/index.ts';

const emptyIds: string[] = [];

interface IPinnedAccountsPanel {
  account: Account;
  limit: number;
}

const PinnedAccountsPanel: React.FC<IPinnedAccountsPanel> = ({ account, limit }) => {
  const dispatch = useAppDispatch();
  const pinned = useAppSelector((state) => state.user_lists.pinned[account.id]?.items || emptyIds).slice(0, limit);

  useEffect(() => {
    dispatch(fetchPinnedAccounts(account.id));
  }, []);

  if (pinned.length === 0) {
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
