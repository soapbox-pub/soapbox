import moreIcon from '@tabler/icons/outline/dots-circle-horizontal.svg';
import { defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import { Card, CardBody, CardHeader, CardTitle } from 'soapbox/components/ui/card.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { SelectDropdown } from 'soapbox/features/forms/index.tsx';
import Balance from 'soapbox/features/wallet/components/balance.tsx';
import CreateWallet from 'soapbox/features/wallet/components/create-wallet.tsx';
import Transactions from 'soapbox/features/wallet/components/transactions.tsx';
import { useTransactions, useWallet } from 'soapbox/features/zap/hooks/useHooks.ts';
import { usePaymentMethod } from 'soapbox/features/zap/usePaymentMethod.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';

const messages = defineMessages({
  payment: { id: 'wallet.payment', defaultMessage: 'Payment Method' },
  relays: { id: 'wallet.relays', defaultMessage: 'Wallet Relays' },
  transactions: { id: 'wallet.transactions', defaultMessage: 'Transactions' },
  wallet: { id: 'wallet.title', defaultMessage: 'Wallet' },
  management: { id: 'wallet.management', defaultMessage: 'Wallet Management' },
  mints: { id: 'wallet.mints', defaultMessage: 'Mints' },
  more: { id: 'wallet.transactions.more', defaultMessage: 'More' },
});

const paymentMethods = {
  lightning: 'lightning',
  cashu: 'cashu',
};

/** User Wallet page. */
const Wallet = () => {
  const intl = useIntl();

  const { account } = useOwnAccount();
  const { wallet: walletData, isLoading } = useWallet();
  const { method, changeMethod } = usePaymentMethod();
  const { transactions } = useTransactions();
  const hasTransactions = transactions && transactions.length > 0;

  if (!account) return null;

  return (
    <>
      {isLoading ?
        <Stack className='h-screen items-center justify-center'>
          <div className='rounded-lg border border-gray-200 p-10 dark:border-gray-700'>
            <Spinner size={50} withText={false} />
          </div>
        </Stack>
        :
        (
          <Column label={intl.formatMessage(messages.wallet)} transparent withHeader={false} slim>
            <Card className='space-y-4 overflow-hidden'>
              <CardHeader>
                <CardTitle title={intl.formatMessage(messages.wallet)} />
              </CardHeader>

              {walletData ? (
                <>
                  <CardBody>
                    <Stack
                      className='rounded-lg border border-gray-200 p-8 dark:border-gray-700'
                      alignItems='center'
                      space={4}
                    >
                      <Balance />
                    </Stack>
                  </CardBody>

                  <CardHeader>
                    <CardTitle title={intl.formatMessage(messages.transactions)} />
                  </CardHeader>

                  <CardBody>
                    <Transactions limit={4} />
                    {hasTransactions && <div className='mt-4 flex w-full justify-center'>
                      <Button
                        icon={moreIcon}
                        theme='primary'
                        to='/wallet/transactions'
                        className='px-6 font-medium'
                      >
                        {intl.formatMessage(messages.more)}
                      </Button>
                    </div>}
                  </CardBody>

                  <CardHeader>
                    <CardTitle title={intl.formatMessage(messages.management)} />
                  </CardHeader>

                  <CardBody>
                    <List>
                      <ListItem label={intl.formatMessage(messages.mints)} to='/wallet/mints' />
                      <ListItem label={intl.formatMessage(messages.relays)} to='/wallet/relays' />
                      <ListItem label={intl.formatMessage(messages.payment)} >
                        <SelectDropdown
                          className='max-w-[200px]'
                          items={paymentMethods}
                          defaultValue={method}
                          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                            changeMethod((event.target.value as 'cashu' | 'lightning'));
                          }}
                        />
                      </ListItem>
                    </List>
                  </CardBody>

                </>
              )
                :
                <>
                  <CardBody>
                    <CreateWallet />
                  </CardBody>

                </>
              }
            </Card>
          </Column>
        )
      }
    </>
  );
};

export default Wallet;