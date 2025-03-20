import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { MintEditor } from 'soapbox/features/wallet/components/editable-lists.tsx';
import { useCashu } from 'soapbox/features/zap/hooks/useCashu.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import toast from 'soapbox/toast.tsx';
import { isURL } from 'soapbox/utils/auth.ts';

const messages = defineMessages({
  title: { id: 'wallet.mints', defaultMessage: 'Mints' },
  loadingError: { id: 'wallet.loading_error', defaultMessage: 'An unexpected error occurred while loading your wallet data.' },
  error: { id: 'wallet.mints.error', defaultMessage: 'Failed to update mints.' },
  empty: { id: 'wallet.mints.empty', defaultMessage: 'At least one mint is required.' },
  url: { id: 'wallet.invalid_url', defaultMessage: 'All strings must be valid URLs.' },
  sucess: { id: 'wallet.mints.sucess', defaultMessage: 'Mints updated with success!' },
  send: { id: 'common.send', defaultMessage: 'Send' },
});

const WalletMints = () => {
  const intl = useIntl();
  const api = useApi();
  const { wallet, getWallet } = useCashu();

  const [relays, setRelays] = useState<string[]>([]);
  const [initialMints, setInitialMints] = useState<string[]>([]);
  const [mints, setMints] = useState<string[]>([]);

  const handleClick = async () =>{
    if (mints.length <= 0) {
      toast.error(intl.formatMessage(messages.empty));
      return;
    }

    if (mints.some((mint) => !isURL(mint))) {
      toast.error(intl.formatMessage(messages.url));
      return;
    }

    if (JSON.stringify(initialMints) === JSON.stringify(mints)) {
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
    getWallet(api, false);
    toast.error(intl.formatMessage(messages.loadingError));
  }, []);

  useEffect(
    () => {
      if (wallet) {
        setMints(wallet.mints ?? []);
        setInitialMints(wallet.mints ?? []);
        setRelays(wallet.relays ?? []);
      }
    }, [wallet],
  );

  return (
    <Column label={intl.formatMessage(messages.title)} >
      <Stack space={2}>
        <MintEditor items={mints} setItems={setMints} />
        <Button className='w-full' theme='primary' onClick={handleClick}>
          {intl.formatMessage(messages.send)}
        </Button>
      </Stack>

    </Column>
  );
};

export default WalletMints;
