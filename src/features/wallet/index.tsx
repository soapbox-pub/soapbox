import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list.tsx';
import { Card, CardBody, CardHeader, CardTitle } from 'soapbox/components/ui/card.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { SelectDropdown } from 'soapbox/features/forms/index.tsx';
import Balance from 'soapbox/features/wallet/components/balance.tsx';
import CreateWallet from 'soapbox/features/wallet/components/create-wallet.tsx';
import Transactions from 'soapbox/features/wallet/components/transactions.tsx';
import { usePaymentMethod } from 'soapbox/features/zap/usePaymentMethod.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { WalletData, baseWalletSchema } from 'soapbox/schemas/wallet.ts';
import toast from 'soapbox/toast.tsx';


const messages = defineMessages({
  payment: { id: 'wallet.payment', defaultMessage: 'Payment Method' },
  relays: { id: 'wallet.relays', defaultMessage: 'Relays' },
  transactions: { id: 'wallet.transactions', defaultMessage: 'Transactions' },
  wallet: { id: 'wallet', defaultMessage: 'Wallet' },
  management: { id: 'wallet.management', defaultMessage: 'Wallet Management' },
  mints: { id: 'wallet.mints', defaultMessage: 'Mints' },
});

const paymentMethods = {
  zap: 'zap',
  cashu: 'cashu',
};

/** User Wallet page. */
const Wallet = () => {
  const api = useApi();
  const intl = useIntl();

  const { account } = useOwnAccount();
  const [walletData, setWalletData] = useState<WalletData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { method, changeMethod } = usePaymentMethod();

  const fetchWallet = async () => {

    try {
      const response = await api.get('/api/v1/ditto/cashu/wallet');
      const data: WalletData = await response.json();
      if (data) {
        const normalizedData = baseWalletSchema.parse(data);
        setWalletData(normalizedData);
      }

    } catch (error) {
      toast.error('Wallet not found');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  if (!account) return null;

  return (
    <>
      {isLoading ?
        <Stack className='h-screen justify-center'>
          <Spinner size={40} withText={false} />
        </Stack>
        :
        (
          <Column label={intl.formatMessage(messages.wallet)} transparent withHeader={false} slim>
            <Card className='space-y-4'>
              <CardHeader>
                <CardTitle title={intl.formatMessage(messages.wallet)} />
              </CardHeader>

              {walletData ? (
                <>
                  <CardBody>
                    <Balance />
                  </CardBody>

                  <CardHeader>
                    <CardTitle title={intl.formatMessage(messages.transactions)} />
                  </CardHeader>

                  <CardBody>
                    <Transactions />
                  </CardBody>

                  <CardHeader>
                    <CardTitle title={intl.formatMessage(messages.management)} />
                  </CardHeader>

                  <CardBody>
                    <List>
                      <ListItem label={intl.formatMessage(messages.mints)} to='/wallet-mints' />
                      <ListItem label={intl.formatMessage(messages.relays)} to='/wallet-relays' />
                      <ListItem label={intl.formatMessage(messages.payment)} >
                        <SelectDropdown
                          className='max-w-[200px]'
                          items={paymentMethods}
                          defaultValue={method}
                          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                            changeMethod((event.target.value as 'cashu' | 'zap'));
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
                    <CreateWallet setWalletData={setWalletData} />
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