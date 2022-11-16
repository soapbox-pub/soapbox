import React from 'react';
import { useDispatch } from 'react-redux';

import { openModal } from 'soapbox/actions/modals';
import CopyableInput from 'soapbox/components/copyable-input';
import { Text, Icon, Stack, HStack } from 'soapbox/components/ui';

import { getExplorerUrl } from '../utils/block-explorer';
import { getTitle } from '../utils/coin-db';

import CryptoIcon from './crypto-icon';

export interface ICryptoAddress {
  address: string,
  ticker: string,
  note?: string,
}

const CryptoAddress: React.FC<ICryptoAddress> = (props): JSX.Element => {
  const { address, ticker, note } = props;

  const dispatch = useDispatch();

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
          className='flex items-start justify-center w-6 mr-2.5'
          ticker={ticker}
          title={title}
        />

        <Text weight='bold'>{title || ticker.toUpperCase()}</Text>

        <HStack alignItems='center' className='ml-auto'>
          <a className='text-gray-500 ml-1' href='#' onClick={handleModalClick}>
            <Icon src={require('@tabler/icons/qrcode.svg')} size={20} />
          </a>

          {explorerUrl && (
            <a className='text-gray-500 ml-1' href={explorerUrl} target='_blank'>
              <Icon src={require('@tabler/icons/external-link.svg')} size={20} />
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
