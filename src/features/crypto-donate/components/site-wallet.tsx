import Stack from 'soapbox/components/ui/stack.tsx';
import { useSoapboxConfig } from 'soapbox/hooks/index.ts';

import CryptoAddress from './crypto-address.tsx';

interface ISiteWallet {
  limit?: number;
}

const SiteWallet: React.FC<ISiteWallet> = ({ limit }): JSX.Element => {
  const { cryptoAddresses } = useSoapboxConfig();
  const addresses = typeof limit === 'number' ? cryptoAddresses.take(limit) : cryptoAddresses;

  return (
    <Stack space={4}>
      {addresses.map(address => (
        <CryptoAddress
          key={address.ticker}
          address={address.address}
          ticker={address.ticker}
          note={address.note}
        />
      ))}
    </Stack>
  );
};

export default SiteWallet;
