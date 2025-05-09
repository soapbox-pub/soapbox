import IconSquareArrowRight from '@tabler/icons/outline/square-arrow-right.svg';
import { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { MintEditor } from 'soapbox/features/wallet/components/editable-lists.tsx';
import { useUpdateWallet, useWallet } from 'soapbox/features/wallet/hooks/useHooks.ts';
import toast from 'soapbox/toast.tsx';
import { isURL } from 'soapbox/utils/auth.ts';

const messages = defineMessages({
  title: { id: 'wallet.mints', defaultMessage: 'Mints' },
  loadingError: { id: 'wallet.loading_error', defaultMessage: 'An unexpected error occurred while loading your wallet data.' },
  empty: { id: 'wallet.mints.empty', defaultMessage: 'At least one mint is required.' },
  url: { id: 'wallet.invalid_url', defaultMessage: 'All strings must be valid URLs.' },
  save: { id: 'common.save', defaultMessage: 'Save' },
});

const WalletMints = () => {
  const intl = useIntl();
  const { walletData } = useWallet();

  const [relays, setRelays] = useState<string[]>([]);
  const [initialMints, setInitialMints] = useState<string[]>([]);
  const [mints, setMints] = useState<string[]>([]);
  const { updateWallet, isLoading } = useUpdateWallet();
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(isLoading);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleClick = async () =>{
    if (mints.length === 0) {
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
      await updateWallet({ mints, relays });
      setInitialMints(mints);
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
          setInitialMints(walletData.mints ?? []);
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
      <Stack space={2} className=''>
        <div className='mx-2 flex justify-end'>
          <a
            href='https://bitcoinmints.com/?tab=mints'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center space-x-1 text-primary-500 hover:underline dark:text-primary-400'
          >
            <FormattedMessage id='wallet.discover_mints' defaultMessage='Discover Mints' />
            <Icon src={IconSquareArrowRight} className='ml-2 size-4 text-primary-500 dark:text-primary-400' />
          </a>
        </div>
      </Stack>
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
              <MintEditor items={mints} setItems={setMints} />
              <Button className='w-full' theme='primary' onClick={handleClick} disabled={isLoading}>
                {intl.formatMessage(messages.save)}
              </Button>
            </Stack>
          );
        }
      })()}
    </Column>
  );
};

export default WalletMints;
