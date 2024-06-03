import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { zap } from 'soapbox/actions/interactions';
import { openModal, closeModal } from 'soapbox/actions/modals';
import Account from 'soapbox/components/account';
import { Stack, Button, Input } from 'soapbox/components/ui';
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
  const [zapAmount, setZapAmount] = useState(500);

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

  return (
    <Stack space={3} element='form' onSubmit={handleSubmit}>
      <Account account={account} showProfileHoverCard={false} />

      <div className='flex justify-center'>
        <Input type='text' min={1} value={zapAmount} className='lg border-ul max-w-20 border-neutral-200 bg-inherit pb-1 text-center text-3xl font-bold outline-none focus:ring-0' />
        <FormattedMessage id='zap.unit' defaultMessage='Zap amount in sats' />
      </div>

      <div className='flex justify-center '>
        <Button onClick={_ => setZapAmount(1)} className='m-1' type='button' theme='muted' text='😐 1' />
        <Button onClick={_ => setZapAmount(500)} className='m-1' type='button' theme='primary' text='👍 500' />
        <Button onClick={_ => setZapAmount(666)} className='m-1' type='button' theme='muted'  text='😈 666' />
        <Button onClick={_ => setZapAmount(1000)} className='m-1' type='button' theme='muted' text='🚀 1K' />
      </div>

      <div className='flex w-full'>
        <Input className='w-10/12' onChange={e => setZapComment(e.target.value)} type='text' placeholder={intl.formatMessage(messages.zap_commentPlaceholder)} />
        <Button type='submit' theme='primary' icon={require('@tabler/icons/outline/bolt.svg')} text={intl.formatMessage(messages.zap_button)} />
      </div>
    </Stack>
  );
};

export default ZapPayRequestForm;
