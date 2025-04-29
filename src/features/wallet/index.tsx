import moreIcon from '@tabler/icons/outline/dots-circle-horizontal.svg';
import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';


import List, { ListItem } from 'soapbox/components/list.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import { Card, CardBody, CardHeader, CardTitle } from 'soapbox/components/ui/card.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { SelectDropdown } from 'soapbox/features/forms/index.tsx';
import Balance from 'soapbox/features/wallet/components/balance.tsx';
import CreateWallet from 'soapbox/features/wallet/components/create-wallet.tsx';
import Transactions from 'soapbox/features/wallet/components/transactions.tsx';
import { useTransactions, useWallet } from 'soapbox/features/wallet/hooks/useHooks.ts';
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
  loading: { id: 'wallet.loading', defaultMessage: 'Loading…' },
  error: { id: 'wallet.loading_error', defaultMessage: 'An unexpected error occurred while loading your wallet data.' },
  retrying: { id: 'wallet.retrying', defaultMessage: 'Retrying in {seconds}s…' },
  retry: { id: 'wallet.retry', defaultMessage: 'Retry Now' },
});

const paymentMethods = {
  lightning: 'lightning',
  cashu: 'cashu',
};

const RETRY_DELAY = 5000;

/** User Wallet page. */
const Wallet = () => {
  const intl = useIntl();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState(RETRY_DELAY / 1000);
  const [retryTimer, setRetryTimer] = useState<NodeJS.Timeout | null>(null);

  const { account } = useOwnAccount();
  const { walletData, getWallet, isLoading, error } = useWallet();
  const { method, changeMethod } = usePaymentMethod();
  const { transactions } = useTransactions();
  const hasTransactions = transactions && transactions.length > 0;

  // Function to handle manual retry
  const handleRetry = () => {
    // Clear any existing timer
    if (retryTimer) {
      clearInterval(retryTimer);
      setRetryTimer(null);
    }

    setIsRetrying(false);
    getWallet(); // Trigger wallet reload with error messages
  };

  // Setup automatic retry when there's an error
  useEffect(() => {
    if (error && !isLoading && !isRetrying) {
      setIsRetrying(true);
      setRetrySeconds(RETRY_DELAY / 1000);

      // Start countdown timer
      const timer = setInterval(() => {
        setRetrySeconds(prevSeconds => {
          if (prevSeconds <= 1) {
            clearInterval(timer);
            handleRetry();
            return RETRY_DELAY / 1000;
          }
          return prevSeconds - 1;
        });
      }, 1000);

      setRetryTimer(timer);

      // Cleanup timer on unmount
      return () => {
        clearInterval(timer);
      };
    }
  }, [error, isLoading, isRetrying]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimer) {
        clearInterval(retryTimer);
      }
    };
  }, [retryTimer]);

  if (!account) return null;

  return (
    <>
      {isLoading && (
        <Stack className='h-screen items-center justify-center'>
          <Spinner size={50} withText={false} />
          <Text>{intl.formatMessage(messages.loading)}</Text>
        </Stack>
      )}
      {error && !isLoading && (
        <Stack className='h-screen items-center justify-center space-y-4'>
          <Text size='xl' weight='bold' theme='danger'>{intl.formatMessage(messages.error)}</Text>
          <Text>{error}</Text>
          {isRetrying && (
            <Text>{intl.formatMessage(messages.retrying, { seconds: retrySeconds })}</Text>
          )}
          <Button onClick={handleRetry} theme='primary'>
            {intl.formatMessage(messages.retry)}
          </Button>
        </Stack>
      )}
      {!isLoading && !error && (
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
            ) : (
              <>
                <CardBody>
                  <CreateWallet />
                </CardBody>
              </>
            )}
          </Card>
        </Column>
      )}
    </>
  );
};

export default Wallet;