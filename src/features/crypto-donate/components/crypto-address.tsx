import React from 'react';

import { openModal } from 'soapbox/actions/modals';
import CopyableInput from 'soapbox/components/copyable-input';
import { Text, Stack, HStack, Button } from 'soapbox/components/ui';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import { useAppDispatch } from 'soapbox/hooks';

import { getExplorerUrl } from '../utils/block-explorer';
import { getTitle } from '../utils/coin-db';

import CryptoIcon from './crypto-icon';

export interface ICryptoAddress {
  address: string;
  ticker: string;
  note?: string;
}

const CryptoAddress: React.FC<ICryptoAddress> = (props): JSX.Element => {
  const { address, ticker, note } = props;

  const dispatch = useAppDispatch();

  const handleModalClick = (e: React.MouseEvent<HTMLElement>): void => {
    dispatch(openModal('CRYPTO_DONATE', props));
    e.preventDefault();
  };

  const title = getTitle(ticker);
  const explorerUrl = getExplorerUrl(ticker, address);

  return (
    <Stack>
      <HStack alignItems='center' className='mb-1'>
        <CryptoIcon
          className='mr-2.5 flex w-6 items-start justify-center rtl:ml-2.5 rtl:mr-0'
          ticker={ticker}
          title={title}
        />

        <Text weight='bold'>{title || ticker.toUpperCase()}</Text>

        <HStack alignItems='center' className='ml-auto'>
          <Button className='!ml-1 !border-none !p-0 !text-gray-500 focus:!ring-transparent focus:ring-offset-0 rtl:ml-0 rtl:mr-1' theme='muted' to='#' onClick={handleModalClick}>
            <SvgIcon src={require('@tabler/icons/outline/qrcode.svg')} size={20} />
          </Button>

          {explorerUrl && (
            <a className='ml-1 text-gray-500 rtl:ml-0 rtl:mr-1' href={explorerUrl} target='_blank'>
              <SvgIcon src={require('@tabler/icons/outline/external-link.svg')} size={20} />
            </a>
          )}
        </HStack>
      </HStack>

      {note && (
        <Text>{note}</Text>
      )}

      <CopyableInput value={address} />
    </Stack>
  );
};

export default CryptoAddress;
