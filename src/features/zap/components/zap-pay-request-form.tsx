import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { zap } from 'soapbox/actions/interactions';
import { openModal, closeModal } from 'soapbox/actions/modals';
import Account from 'soapbox/components/account';
import { Stack, Button, Select } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import type {  Account as AccountEntity, Status as StatusEntity   } from 'soapbox/types/entities';

interface IZapPayRequestForm {
  status?: StatusEntity;
  account: AccountEntity;
}

const messages = defineMessages({
  zap_button: { id: 'status.zap', defaultMessage: 'Zap' },
  zap_commentPlaceholder: { id: 'zap.comment_input.placeholder', defaultMessage: 'Optional comment' },
});

const ZapPayRequestForm = ({ account, status }: IZapPayRequestForm) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [zapComment, setZapComment] = useState('');
  const [zapAmount, setZapAmount] = useState(1);

  const handleSubmit = async (e?: React.FormEvent<Element>) => {
    e?.preventDefault();
    if (status) {
      const invoice = await dispatch(zap(status, zapAmount * 1000, zapComment));
      // If invoice is undefined it means the user has paid through his extension
      // In this case, we simply close the modal
      if (!invoice) {
        dispatch(closeModal('ZAP_PAY_REQUEST'));
        return;
      }
      // open QR code modal
      dispatch(openModal('ZAP_INVOICE', { invoice, account }));
    }
  };

  const zapOptions = () => {
    return (
      [
        <option key={1} disabled>
          <FormattedMessage id='zap.unit' defaultMessage='Zap amount in sats' />
        </option>,
        <option key={2} value={1} defaultValue={1}>1 😐</option>,
        <option key={3} value={500}>500 👍</option>,
        <option key={4} value={666}>666 😈 </option>,
        <option key={5} value={1000}>1k 🚀</option>,
      ]
    );
  };

  return (
    <Stack element='form' onSubmit={handleSubmit}>
      <Account account={account} showProfileHoverCard={false} />
      <Select
        onChange={e => setZapAmount(Number(e.target.value))}
        children={zapOptions()}
        size={zapOptions().length}
      />
      <input
        type='text'
        onChange={e => setZapComment(e.target.value)}
        placeholder={intl.formatMessage(messages.zap_commentPlaceholder)}
      />
      <Button type='submit' theme='primary' icon={require('@tabler/icons/outline/bolt.svg')} text={intl.formatMessage(messages.zap_button)} />
    </Stack>
  );
};

export default ZapPayRequestForm;
