import React  from 'react';

import { Modal } from 'soapbox/components/ui';
import ZapPayRequestForm from 'soapbox/features/zap/components/zap-pay-request-form';

import type { Status as StatusEntity, Account as AccountEntity   } from 'soapbox/types/entities';

interface IZapPayRequestModal {
  account: AccountEntity;
  status?: StatusEntity;
  onClose:(type?: string) => void;
}

const ZapPayRequestModal: React.FC<IZapPayRequestModal> = ({ account, status, onClose }) => {
  const onClickClose = () => {
    onClose('ZAP_PAY_REQUEST');
  };


  return (
    <Modal width='2xl'>
      <ZapPayRequestForm account={account} status={status} onClose={onClickClose} />
    </Modal>
  );
};

export default ZapPayRequestModal;
