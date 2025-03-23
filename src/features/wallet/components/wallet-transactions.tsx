import moreIcon from '@tabler/icons/outline/dots-circle-horizontal.svg';
import { defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Transactions from 'soapbox/features/wallet/components/transactions.tsx';

const messages = defineMessages({
  title: { id: 'wallet.transactions', defaultMessage: 'Transactions' },
  more: { id: 'wallet.transactions.show_more', defaultMessage: 'Show More' },
});

const WalletTransactions = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.title)} >
      <Transactions limit={20} />
      <div className='flex w-full justify-center'>
        <Button icon={moreIcon} theme='primary' to='/wallet/transactions'>
          {intl.formatMessage(messages.more)}
        </Button>
      </div>
    </Column>
  );
};

export default WalletTransactions;
