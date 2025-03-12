import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list.tsx';
import { Card, CardBody, CardHeader, CardTitle } from 'soapbox/components/ui/card.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Balance from 'soapbox/features/my-wallet/components/balance.tsx';
import CreateWallet from 'soapbox/features/my-wallet/components/create-wallet.tsx';
import Transactions from 'soapbox/features/my-wallet/components/transactions.tsx';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { WalletData, baseWalletSchema } from 'soapbox/schemas/wallet.ts';
import toast from 'soapbox/toast.tsx';


const messages = defineMessages({
  relays: { id: 'my_wallet.relays', defaultMessage: 'Relays' },
  transactions: { id: 'my_wallet.transactions', defaultMessage: 'Transactions' },
  myWallet: { id: 'my_wallet', defaultMessage: 'My Wallet' },
  management: { id: 'my_wallet.management', defaultMessage: 'Wallet Management' },
  mints: { id: 'my_wallet.mints', defaultMessage: 'Mints' },
});

/** User Wallet page. */
const MyWallet = () => {
  const api = useApi();
  const intl = useIntl();

  const { account } = useOwnAccount();
  const [walletData, setWalletData] = useState<WalletData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
          <Column label={intl.formatMessage(messages.myWallet)} transparent withHeader={false} slim>
            <Card className='space-y-4'>
              <CardHeader>
                <CardTitle title={intl.formatMessage(messages.myWallet)} />
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
                      <ListItem label={intl.formatMessage(messages.mints)} to='/my-wallet-mints' />
                      <ListItem label={intl.formatMessage(messages.relays)} to='/my-wallet-relays' />
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

export default MyWallet;