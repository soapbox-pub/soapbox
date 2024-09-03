import { QRCodeCanvas } from 'qrcode.react';
import React, { useEffect, useState }  from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { zap } from 'soapbox/actions/interactions';
import CopyableInput from 'soapbox/components/copyable-input';
import { Modal, Button, Stack, HStack } from 'soapbox/components/ui';
import ZapSplit from 'soapbox/features/zap/components/zap-split';
import { useAppDispatch } from 'soapbox/hooks';

import type { Status as StatusEntity, Account as AccountEntity   } from 'soapbox/types/entities';

const messages = defineMessages({
  zap_open_wallet: { id: 'zap.open_wallet', defaultMessage: 'Open Wallet' },
  zap_next: { id: 'zap.next', defaultMessage: 'Next' },
});

interface IZapSplitModal {
  account: AccountEntity;
  status?: StatusEntity;
  onClose:(type?: string) => void;
  zapAmount: number;
}

const ZapSplitModal: React.FC<IZapSplitModal> = ({ account, status, onClose, zapAmount = 50 }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [invoice, setInvoice] = useState<string | null>(null);
  const [widthModal, setWidthModal] = useState<'xl' | 'xs' | 'sm' | 'md' | 'lg' | '2xl' | '3xl' | '4xl' | undefined>('sm');


  const onClickClose = () => {
    onClose('ZAP_SPLIT');
  };

  const renderTitle = () => {
    return <FormattedMessage id='zap_split.title' defaultMessage='Zap Split' />;
  };

  const renderTitleQr = () => {
    return <FormattedMessage id='zap.send_to' defaultMessage='Send zaps to {target}' values={{ target: account.display_name }} />;
  };

  const handleSubmit = async () => {
    const zapComment = '';
    const invoice = await dispatch(zap(account, status, zapAmount * 1000, zapComment));

    if (!invoice) {
      return;
    }

    setInvoice(invoice);
    setWidthModal('2xl');
  };

  useEffect(() => {
    handleSubmit();
  }, []);

  const step = 2 ;
  const amountAdm = 3;

  return (
    <Modal
      title={renderTitle()} onClose={onClickClose} width={widthModal}
    >
      <div className='relative flex flex-col sm:flex-row'>
        <ZapSplit account={account} status={status} zapAmount={50} />

        {invoice &&  <div className='border-grey-500 mt-4 flex w-full border-t pt-4 sm:ml-4 sm:w-4/5 sm:border-l sm:border-t-0 sm:pl-4'>
          <Stack space={6} className='relative m-auto' alignItems='center'>
            <h3 className='text-xl font-bold'>
              {renderTitleQr()}
            </h3>
            <QRCodeCanvas value={invoice} />
            <div className='w-full'>
              <CopyableInput value={invoice} />
            </div>
            <HStack space={2}>
              <a href={'lightning:' + invoice}>
                <Button type='submit' theme='primary' icon={require('@tabler/icons/outline/folder-open.svg')} text={intl.formatMessage(messages.zap_open_wallet)} />
              </a>
              <Button type='button' theme='muted' className='!font-bold' text={intl.formatMessage(messages.zap_next)} />
            </HStack>
          </Stack>
        </div>}
        <p className='absolute -bottom-4 -right-2'>
          <span className='font-bold'>
            {step}/{amountAdm}
          </span>
        </p>
      </div>
    </Modal>
  );
};

export default ZapSplitModal;
