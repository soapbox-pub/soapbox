import { QRCodeCanvas } from 'qrcode.react';
import React  from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { closeModal } from 'soapbox/actions/modals';
import CopyableInput from 'soapbox/components/copyable-input';
import { Modal, Button } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import type { Account as AccountEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  zap_open_wallet: { id: 'zap.open_wallet', defaultMessage: 'Open Wallet' },
});

interface IZapInvoice{
  account: AccountEntity;
  invoice: string;
  onClose:(type?: string) => void;
}

const ZapInvoiceModal: React.FC<IZapInvoice> = ({ account, invoice, onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const onClickClose = () => {
    onClose('ZAP_INVOICE');
    dispatch(closeModal('ZAP_PAY_REQUEST'));
  };

  const renderTitle = () => {
    return <FormattedMessage id='zap.send_to' defaultMessage='Send zaps to {target}' values={{ target: account.display_name }} />;
  };

  return (
    <Modal title={renderTitle()} onClose={onClickClose}>
      <QRCodeCanvas value={invoice} />
      <CopyableInput value={invoice} />
      <a href={'lightning:' + invoice}>
        <Button type='submit' theme='primary' icon={require('@tabler/icons/outline/folder-open.svg')} text={intl.formatMessage(messages.zap_open_wallet)} />
      </a>
    </Modal>
  );
};

export default ZapInvoiceModal;
