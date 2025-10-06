import clsx from 'clsx';
import { List as ImmutableList, OrderedSet as ImmutableOrderedSet } from 'immutable';

import Avatar from '@/components/ui/avatar.tsx';
import HStack from '@/components/ui/hstack.tsx';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { makeGetAccount } from '@/selectors/index.ts';

import type { Account } from '@/types/entities.ts';

const getAccount = makeGetAccount();

interface IAvatarStack {
  accountIds: ImmutableOrderedSet<string>;
  limit?: number;
}

const AvatarStack: React.FC<IAvatarStack> = ({ accountIds, limit = 3 }) => {
  const accounts = useAppSelector(state => ImmutableList(accountIds.slice(0, limit).map(accountId => getAccount(state, accountId)).filter(account => account))) as ImmutableList<Account>;

  return (
    <HStack className='relative' aria-hidden>
      {accounts.map((account, i) => (
        <div
          className={clsx('relative', { '-ml-3': i !== 0 })}
          key={account.id}
          style={{ zIndex: limit - i }}
        >
          <Avatar
            className='ring-1 ring-white dark:ring-primary-900'
            src={account.avatar}
            size={20}
          />
        </div>
      ))}
    </HStack>
  );
};

export default AvatarStack;
