import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { RelayEditor } from 'soapbox/features/wallet/components/editable-lists.tsx';
import { useWallet } from 'soapbox/features/zap/hooks/useHooks.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import toast from 'soapbox/toast.tsx';
import { isURL } from 'soapbox/utils/auth.ts';

const messages = defineMessages({
  title: { id: 'wallet.relays', defaultMessage: 'Wallet Relays' },
  loadingError: { id: 'wallet.loading_error', defaultMessage: 'An unexpected error occurred while loading your wallet data.' },
  error: { id: 'wallet.relays.error', defaultMessage: 'Failed to update relays.' },
  empty: { id: 'wallet.relays.empty', defaultMessage: 'At least one relay is required.' },
  url: { id: 'wallet.invalid_url', defaultMessage: 'All strings must be valid URLs.' },
  success: { id: 'wallet.relays.success', defaultMessage: 'Relays updated with success!' },
  send: { id: 'common.send', defaultMessage: 'Send' },
});

const WalletRelays = () => {
  const intl = useIntl();
  const api = useApi();
  const { walletData } = useWallet();

  const [relays, setRelays] = useState<string[]>([]);
  const [initialRelays, setInitialRelays] = useState<string[]>([]);
  const [mints, setMints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleClick = async () =>{
    if (relays.length === 0) {
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
      setInitialRelays(relays);
      toast.success(intl.formatMessage(messages.success));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : intl.formatMessage(messages.error);
      toast.error(errorMessage);
      console.error(error);
    }
  };

  useEffect(
    () => {
      setIsLoading(true);
      setHasError(false);

      if (walletData) {
        try {
          setMints(walletData.mints ?? []);
          setInitialRelays(walletData.relays ?? []);
          setRelays(walletData.relays ?? []);
        } catch (error) {
          console.error('Error setting wallet data:', error);
          setHasError(true);
          toast.error(intl.formatMessage(messages.loadingError));
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        if (walletData === undefined) {
          setIsLoading(true);
        } else if (walletData === null) {
          setHasError(true);
          toast.error(intl.formatMessage(messages.loadingError));
        }
      }
    }, [walletData, intl],
  );

  return (
    <Column label={intl.formatMessage(messages.title)} >
      {(() => {
        if (isLoading) {
          return (
            <Stack space={2} className='flex h-32 items-center justify-center'>
              <Spinner />
            </Stack>
          );
        } else if (hasError) {
          return (
            <Stack space={2} className='flex h-32 items-center justify-center text-center'>
              <Text theme='danger'>{intl.formatMessage(messages.loadingError)}</Text>
            </Stack>
          );
        } else {
          return (
            <Stack space={2}>
              <RelayEditor items={relays} setItems={setRelays} />
              <Button className='w-full' theme='primary' onClick={handleClick}>
                {intl.formatMessage(messages.send)}
              </Button>
            </Stack>
          );
        }
      })()}
    </Column>
  );
};

export default WalletRelays;
