import React  from 'react';
import { FormattedMessage } from 'react-intl';

import { Modal } from 'soapbox/components/ui';

import ZapPayRequestForm from '../../../zap/components/zap-pay-request-form';

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

  const renderTitle = () => {
    return <FormattedMessage id='zap.send_to' defaultMessage='Send zaps to {target}' values={{ target: account.display_name }} />;
  };

  return (
    <Modal title={renderTitle()} onClose={onClickClose}>
      <ZapPayRequestForm account={account} status={status} />
    </Modal>
  );
};

export default ZapPayRequestModal;
