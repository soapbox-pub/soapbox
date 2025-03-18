import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { RelayEditor } from 'soapbox/features/wallet/components/editable-lists.tsx';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { WalletData, baseWalletSchema } from 'soapbox/schemas/wallet.ts';
import toast from 'soapbox/toast.tsx';

const messages = defineMessages({
  title: { id: 'wallet.relays', defaultMessage: 'Wallet Relays' },
  error: { id: 'wallet.loading_error', defaultMessage: 'An unexpected error occurred while loading your wallet data.' },
  send: { id: 'common.send', defaultMessage: 'Send' },
});

const WalletRelays = () => {
  const intl = useIntl();
  const api = useApi();

  const [relays, setRelays] = useState<string[]>(['teste.com']);

  const fetchWallet = async () => {
    try {
      const response = await api.get('/api/v1/ditto/cashu/wallet');
      const data: WalletData = await response.json();
      if (data) {
        const normalizedData = baseWalletSchema.parse(data);
        setRelays(normalizedData.relays);
      }

    } catch (error) {
      toast.error(intl.formatMessage(messages.error));
    }
  };

  const handleClick = async () =>{
    try {
      const response = await api.post('/api/v1/ditto/cashu/wallet');
      const data: WalletData = await response.json();
      if (data) {
        const normalizedData = baseWalletSchema.parse(data);
        setRelays(normalizedData.relays);
      }

    } catch (error) {
      toast.error('Wallet not found');
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <Column label={intl.formatMessage(messages.title)} >
      <Stack space={2}>
        <RelayEditor items={relays} setItems={setRelays} />
        <Button className='w-full' theme='primary' onClick={handleClick}>
          {intl.formatMessage(messages.send)}
        </Button>
      </Stack>

    </Column>
  );
};

export default WalletRelays;
