import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { Avatar, HStack, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification-badge';
import useAccountSearch from 'soapbox/queries/search';

import type { Account } from 'soapbox/types/entities';

interface IResults {
  accountSearchResult: ReturnType<typeof useAccountSearch>
  onSelect(id: string): void
}

const Results = ({ accountSearchResult, onSelect }: IResults) => {
  const { data: accounts, isFetching, hasNextPage, fetchNextPage } = accountSearchResult;

  const [isNearBottom, setNearBottom] = useState<boolean>(false);
  const [isNearTop, setNearTop] = useState<boolean>(true);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  const renderAccount = useCallback((_index: number, account: Account) => (
    <button
      key={account.id}
      type='button'
      className='flex w-full flex-col rounded-lg px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-800'
      onClick={() => onSelect(account.id)}
      data-testid='account'
    >
      <HStack alignItems='center' space={2}>
        <Avatar src={account.avatar} size={40} />

        <Stack alignItems='start'>
          <div className='flex grow items-center space-x-1'>
            <Text weight='bold' size='sm' truncate>{account.display_name}</Text>
            {account.verified && <VerificationBadge />}
          </div>
          <Text size='sm' weight='medium' theme='muted' truncate>@{account.acct}</Text>
        </Stack>
      </HStack>
    </button>
  ), []);

  return (
    <div className='relative grow'>
      <Virtuoso
        data={accounts}
        itemContent={(index, chat) => (
          <div className='px-2'>
            {renderAccount(index, chat)}
          </div>
        )}
        endReached={handleLoadMore}
        atTopStateChange={(atTop) => setNearTop(atTop)}
        atBottomStateChange={(atBottom) => setNearBottom(atBottom)}
      />

      <>
        <div
          className={clsx('pointer-events-none absolute inset-x-0 top-0 flex justify-center rounded-t-lg bg-gradient-to-b from-white to-transparent pb-12 pt-8 transition-opacity duration-500 dark:from-gray-900', {
            'opacity-0': isNearTop,
            'opacity-100': !isNearTop,
          })}
        />
        <div
          className={clsx('pointer-events-none absolute inset-x-0 bottom-0 flex justify-center rounded-b-lg bg-gradient-to-t from-white to-transparent pb-8 pt-12 transition-opacity duration-500 dark:from-gray-900', {
            'opacity-0': isNearBottom,
            'opacity-100': !isNearBottom,
          })}
        />
      </>
    </div>
  );
};

export default Results;
