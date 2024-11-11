import externalLinkIcon from '@tabler/icons/outline/external-link.svg';
import qrcodeIcon from '@tabler/icons/outline/qrcode.svg';
import { Link } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals.ts';
import CopyableInput from 'soapbox/components/copyable-input.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

import { getExplorerUrl } from '../utils/block-explorer.ts';
import { getTitle } from '../utils/coin-db.ts';

import CryptoIcon from './crypto-icon.tsx';

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
          <Link to={'/'} className='inline-flex'>
            <button className='!ml-1 space-x-2 !border-none !p-0 !text-gray-500 focus:!ring-transparent focus:ring-offset-0 rtl:ml-0 rtl:mr-1 rtl:space-x-reverse' onClick={handleModalClick}>
              <SvgIcon src={qrcodeIcon} size={20} />
            </button>
          </Link>

          {explorerUrl && (
            <a className='ml-1 text-gray-500 rtl:ml-0 rtl:mr-1' href={explorerUrl} target='_blank'>
              <SvgIcon src={externalLinkIcon} size={20} />
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
