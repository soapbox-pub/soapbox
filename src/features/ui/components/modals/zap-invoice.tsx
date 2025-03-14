import folderOpenIcon from '@tabler/icons/outline/folder-open.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import { QRCodeCanvas } from 'qrcode.react';
import React  from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { closeModal, openModal } from 'soapbox/actions/modals.ts';
import { SplitValue } from 'soapbox/api/hooks/zap-split/useZapSplit.ts';
import CopyableInput from 'soapbox/components/copyable-input.tsx';
import Avatar from 'soapbox/components/ui/avatar.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { ZapSplitData } from 'soapbox/schemas/zap-split.ts';
import { emojifyText } from 'soapbox/utils/emojify.tsx';

import type { Account as AccountEntity } from 'soapbox/types/entities.ts';

const closeIcon = xIcon;

const messages = defineMessages({
  zap_open_wallet: { id: 'zap.open_wallet', defaultMessage: 'Open Wallet' },
  zap_next: { id: 'zap.next', defaultMessage: 'Next' },
});

interface ISplitData {
  hasZapSplit: boolean;
  zapSplitAccounts: ZapSplitData[];
  splitValues: SplitValue[];
}

interface IZapInvoice{
  account: AccountEntity;
  invoice: string;
  splitData: ISplitData;
  onClose:(type?: string) => void;
}

const ZapInvoiceModal: React.FC<IZapInvoice> = ({ account, invoice, splitData, onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { hasZapSplit, zapSplitAccounts, splitValues } = splitData;
  const onClickClose = () => {
    onClose('ZAP_INVOICE');
    dispatch(closeModal('PAY_REQUEST'));
  };

  const renderTitle = () => {
    return (
      <FormattedMessage
        id='zap.send_to'
        defaultMessage='Send zaps to {target}'
        values={{ target: emojifyText(account.display_name, account.emojis) }}
      />
    );
  };

  const handleNext = () => {
    onClose('ZAP_INVOICE');
    dispatch(openModal('ZAP_SPLIT', { zapSplitAccounts, splitValues }));
  };

  return (
    <Modal width='sm'>
      <Stack space={6} className='relative m-auto' alignItems='center' >
        <Avatar src={account.avatar} size={64} />
        <h3 className='text-xl font-bold'>
          {renderTitle()}
        </h3>
        <IconButton src={closeIcon} onClick={onClickClose} className='absolute right-[2%] top-[-8%] text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 rtl:rotate-180' />
        <QRCodeCanvas value={invoice} />
        <div className='w-full'>
          <CopyableInput value={invoice} />
        </div>
        <HStack space={2}>
          <a href={'lightning:' + invoice}>
            <Button type='submit' theme='primary' icon={folderOpenIcon} text={intl.formatMessage(messages.zap_open_wallet)} />
          </a>
          {hasZapSplit && <Button type='button' theme='muted' onClick={handleNext} text={intl.formatMessage(messages.zap_next)} />}
        </HStack>
      </Stack>
    </Modal>
  );
};

export default ZapInvoiceModal;
