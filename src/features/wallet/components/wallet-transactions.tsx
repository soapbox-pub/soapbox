import { useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Column } from 'soapbox/components/ui/column.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Transactions from 'soapbox/features/wallet/components/transactions.tsx';
import { useTransactions } from 'soapbox/features/zap/hooks/useHooks.ts';

const messages = defineMessages({
  title: { id: 'wallet.transactions', defaultMessage: 'Transactions' },
  more: { id: 'wallet.transactions.show_more', defaultMessage: 'Show More' },
  loading: { id: 'wallet.loading', defaultMessage: 'Loading…' },
});

const WalletTransactions = () => {
  const intl = useIntl();
  const { isLoading, expandTransactions } = useTransactions();
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowSpinner(true);
          if (!isLoading) expandTransactions();
        }
      },
      { rootMargin: '100px' },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [expandTransactions, isLoading]);

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Transactions />
      <div className='flex w-full justify-center' ref={observerRef}>
        {showSpinner && isLoading && <Spinner />}
      </div>
    </Column>
  );
};

export default WalletTransactions;