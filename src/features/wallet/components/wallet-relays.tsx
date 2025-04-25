import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { RelayEditor } from 'soapbox/features/wallet/components/editable-lists.tsx';
import { useUpdateWallet, useWallet } from 'soapbox/features/wallet/hooks/useHooks.ts';
import toast from 'soapbox/toast.tsx';
import { isURL } from 'soapbox/utils/auth.ts';

const messages = defineMessages({
  title: { id: 'wallet.relays', defaultMessage: 'Wallet Relays' },
  loadingError: { id: 'wallet.loading_error', defaultMessage: 'An unexpected error occurred while loading your wallet data.' },
  empty: { id: 'wallet.relays.empty', defaultMessage: 'At least one relay is required.' },
  url: { id: 'wallet.invalid_url', defaultMessage: 'All strings must be valid URLs.' },
  send: { id: 'common.send', defaultMessage: 'Send' },
});

const WalletRelays = () => {
  const intl = useIntl();
  const { walletData } = useWallet();

  const [relays, setRelays] = useState<string[]>([]);
  const [initialRelays, setInitialRelays] = useState<string[]>([]);
  const [mints, setMints] = useState<string[]>([]);
  const { updateWallet, isLoading } = useUpdateWallet();
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(isLoading);
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
      await updateWallet({ mints, relays });
      setInitialRelays(relays);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(
    () => {
      setIsInitialLoading(true);
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
          setIsInitialLoading(false);
        }
      } else {
        setIsInitialLoading(false);
        if (walletData === undefined) {
          setIsInitialLoading(true);
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
        if (isInitialLoading) {
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
              <Button className='w-full' theme='primary' onClick={handleClick} disabled={isLoading}>
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
