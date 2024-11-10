import { Modal } from 'soapbox/components/ui/index.ts';
import DetailedCryptoAddress from 'soapbox/features/crypto-donate/components/detailed-crypto-address.tsx';

import type { ICryptoAddress } from '../../../crypto-donate/components/crypto-address.tsx';

const CryptoDonateModal: React.FC<ICryptoAddress & { onClose: () => void }> = ({ onClose, ...props }) => {

  return (
    <Modal onClose={onClose} width='xs'>
      <div className='crypto-donate-modal'>
        <DetailedCryptoAddress {...props} />
      </div>
    </Modal>
  );

};

export default CryptoDonateModal;
