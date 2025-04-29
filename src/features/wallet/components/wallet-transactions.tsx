import { useEffect, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';


import { Column } from 'soapbox/components/ui/column.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Transactions from 'soapbox/features/wallet/components/transactions.tsx';
import { useTransactions, useWalletStore } from 'soapbox/features/wallet/hooks/useHooks.ts';

const messages = defineMessages({
  title: { id: 'wallet.transactions', defaultMessage: 'Transactions' },
  more: { id: 'wallet.transactions.show_more', defaultMessage: 'Show More' },
  loading: { id: 'wallet.loading', defaultMessage: 'Loading…' },
  noMoreTransactions: { id: 'wallet.transactions.no_more', defaultMessage: 'You reached the end of transactions' },
});

const WalletTransactions = () => {
  const intl = useIntl();
  const { isLoading, isExpanding, expandTransactions } = useTransactions();
  const observerRef = useRef<HTMLDivElement | null>(null);
  const { nextTransaction } = useWalletStore();
  const hasMore = !!nextTransaction;

  useEffect(() => {
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !isLoading && hasMore) {
          await expandTransactions();
        }
      },
      { rootMargin: '100px' },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [expandTransactions, isLoading, hasMore]);

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Transactions />
      <div className='flex w-full justify-center' ref={observerRef}>
        {isLoading || isExpanding && <Spinner />}
        {!hasMore && (
          <div className='py-4 text-center text-gray-600'>
            {intl.formatMessage(messages.noMoreTransactions)}
          </div>
        )}
      </div>
    </Column>
  );
};

export default WalletTransactions;