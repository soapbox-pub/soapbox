import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { RelayEditor } from 'soapbox/features/wallet/components/editable-lists.tsx';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { WalletData, baseWalletSchema } from 'soapbox/schemas/wallet.ts';
import toast from 'soapbox/toast.tsx';
import { isURL } from 'soapbox/utils/auth.ts';

const messages = defineMessages({
  title: { id: 'wallet.relays', defaultMessage: 'Wallet Relays' },
  loadingError: { id: 'wallet.loading_error', defaultMessage: 'An unexpected error occurred while loading your wallet data.' },
  error: { id: 'wallet.relays.error', defaultMessage: 'Failed to update mints.' },
  empty: { id: 'wallet.relays.empty', defaultMessage: 'At least one relay is required.' },
  url: { id: 'wallet.invalid_url', defaultMessage: 'All strings must be valid URLs.' },
  sucess: { id: 'wallet.relays.sucess', defaultMessage: 'Relays updated with success!' },
  send: { id: 'common.send', defaultMessage: 'Send' },
});

const WalletRelays = () => {
  const intl = useIntl();
  const api = useApi();

  const [relays, setRelays] = useState<string[]>([]);
  const [initialRelays, setInitialRelays] = useState<string[]>([]);
  const [mints, setMints] = useState<string[]>([]);

  const fetchWallet = async () => {
    try {
      const response = await api.get('/api/v1/ditto/cashu/wallet');
      const data: WalletData = await response.json();
      if (data) {
        const normalizedData = baseWalletSchema.parse(data);
        setMints(normalizedData.mints);
        setRelays(normalizedData.relays);
        setInitialRelays(normalizedData.relays);
      }

    } catch (error) {
      toast.error(intl.formatMessage(messages.loadingError));
    }
  };

  const handleClick = async () =>{
    if (relays.length <= 0) {
      toast.error(intl.formatMessage(messages.empty));
      return;
    }

    if (relays.some((relay) => !isURL(relay))) {
      toast.error(intl.formatMessage(messages.url));
      return;
    }

    if (JSON.stringify(initialRelays) === JSON.stringify(relays)) {
      return;
    }

    try {
      await api.put('/api/v1/ditto/cashu/wallet', { mints: mints, relays: relays });
      toast.success(intl.formatMessage(messages.sucess));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : intl.formatMessage(messages.error);
      toast.error(errorMessage);
      console.error(error);
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
