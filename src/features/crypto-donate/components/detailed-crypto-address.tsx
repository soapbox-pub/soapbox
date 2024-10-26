import { QRCodeCanvas as QRCode } from 'qrcode.react';
import React from 'react';

import CopyableInput from 'soapbox/components/copyable-input';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';

import { getExplorerUrl } from '../utils/block-explorer';
import { getTitle } from '../utils/coin-db';

import CryptoIcon from './crypto-icon';

interface IDetailedCryptoAddress {
  address: string;
  ticker: string;
  note?: string;
}

const DetailedCryptoAddress: React.FC<IDetailedCryptoAddress> = ({ address, ticker, note }): JSX.Element => {
  const title = getTitle(ticker);
  const explorerUrl = getExplorerUrl(ticker, address);

  return (
    <div className='flex flex-col p-0'>
      <div className='mb-1.5 flex items-center'>
        <CryptoIcon
          className='mr-2.5 flex w-6 items-start justify-center'
          ticker={ticker}
          title={title}
        />
        <div className='font-bold'>{title || ticker.toUpperCase()}</div>
        <div className='ml-auto flex'>
          {explorerUrl && <a className='ml-2 text-gray-400' href={explorerUrl} target='_blank'>
            <SvgIcon size={20} src={require('@tabler/icons/outline/external-link.svg')} />
          </a>}
        </div>
      </div>
      {note && <div className='mb-2.5'>{note}</div>}
      <div className='mb-3 flex items-center justify-center p-2.5'>
        <QRCode className='rounded-lg' value={address} includeMargin />
      </div>

      <CopyableInput value={address} />
    </div>
  );
};

export default DetailedCryptoAddress;
