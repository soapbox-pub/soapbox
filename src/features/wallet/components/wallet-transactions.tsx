import moreIcon from '@tabler/icons/outline/dots-circle-horizontal.svg';
import { defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
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

  return (
    <Column label={intl.formatMessage(messages.title)} >
      <Transactions />
      <div className='flex w-full justify-center'>
        <Button icon={isLoading ? undefined : moreIcon} theme='primary' onClick={expandTransactions}>
          {isLoading ? intl.formatMessage(messages.loading) : intl.formatMessage(messages.more)}
        </Button>
      </div>
    </Column>
  );
};

export default WalletTransactions;
