import React  from 'react';

import Modal from '@/components/ui/modal.tsx';
import PayRequestForm from '@/features/zap/components/pay-request-form.tsx';

import type { Status as StatusEntity, Account as AccountEntity   } from '@/types/entities.ts';

interface IPayRequestModal {
  account: AccountEntity;
  status?: StatusEntity;
  onClose:(type?: string) => void;
}

const PayRequestModal: React.FC<IPayRequestModal> = ({ account, status, onClose }) => {
  const onClickClose = () => {
    onClose('PAY_REQUEST');
  };

  return (
    <Modal width='lg'>
      <PayRequestForm account={account} status={status} onClose={onClickClose} />
    </Modal>
  );
};

export default PayRequestModal;
