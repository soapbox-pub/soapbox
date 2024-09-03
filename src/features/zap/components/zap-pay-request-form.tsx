import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { zap } from 'soapbox/actions/interactions';
import { openModal, closeModal } from 'soapbox/actions/modals';
import chestIcon from 'soapbox/assets/icons/blue-chest.png';
import coinStack from 'soapbox/assets/icons/coin-stack.png';
import coinIcon from 'soapbox/assets/icons/coin.png';
import moneyBag from 'soapbox/assets/icons/money-bag.png';
import pileCoin from 'soapbox/assets/icons/pile-coin.png';
import questionIcon from 'soapbox/assets/icons/questionIcon.svg';
import Account from 'soapbox/components/account';
import { Stack, HStack, Button, Input } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';
// import { useApi, useAppDispatch } from 'soapbox/hooks';
// import { zapSplitSchema } from 'soapbox/schemas/zap-split';

import type {  Account as AccountEntity, Status as StatusEntity   } from 'soapbox/types/entities';

interface IZapPayRequestForm {
  status?: StatusEntity;
  account: AccountEntity;
}

const messages = defineMessages({
  zap_button_rounded: { id: 'zap.button.text.rounded', defaultMessage: 'Zap {amount}K sats' },
  zap_button: { id: 'zap.button.text.raw', defaultMessage: 'Zap {amount} sats' },
  zap_commentPlaceholder: { id: 'zap.comment_input.placeholder', defaultMessage: 'Optional comment' },
});

const ZapPayRequestForm = ({ account, status }: IZapPayRequestForm) => {
  // const api = useApi();
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [zapComment, setZapComment] = useState('');
  // amount in millisatoshi
  const [zapAmount, setZapAmount] = useState(50);

  // const fetchZapSplit = async (id: string) => {
  //   return await api.get(`/api/v1/ditto/${id}/zap_splits`);
  // };

  const handleSubmit = async (e?: React.FormEvent<Element>) => {
    e?.preventDefault();
    // const hasZapSplit = await fetchZapSplit(status!.id);
    // const teste = zapSplitSchema.parse(hasZapSplit.data);
    const invoice = await dispatch(zap(account, status, zapAmount * 1000, zapComment));

    // If invoice is undefined it means the user has paid through his extension
    // In this case, we simply close the modal
    if (!invoice) {
      dispatch(closeModal('ZAP_PAY_REQUEST'));
      // Dispatch the adm account
      // hasZapSplit && dispatch(openModal('ZAP_SPLIT', { account }));
      return;
    }
    // open QR code modal
    dispatch(openModal('ZAP_INVOICE', { invoice, account }));
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    e?.preventDefault();
    const inputAmount = e.target.value.replace(/[^0-9]/g, '');

    const maxSendable = 250000000;
    // multiply by 1000 to convert from satoshi to millisatoshi
    if (maxSendable * 1000 > Number(inputAmount)) {
      setZapAmount(Number(inputAmount));
    }
  };

  const renderZapButtonText = () => {
    if (zapAmount >= 1000) {
      return intl.formatMessage(messages.zap_button_rounded, { amount: Math.round((zapAmount / 1000) * 10) / 10 });
    }
    return intl.formatMessage(messages.zap_button, { amount: zapAmount });
  };

  return (
    <Stack space={3} alignItems='center' element='form' onSubmit={handleSubmit} >
      <Account account={account} showProfileHoverCard={false} />
      <div>
        <FormattedMessage id='zap.unit' defaultMessage='Zap amount in sats' />
      </div>

      <div className='flex justify-center '>
        <Button onClick={() => setZapAmount(50)} className='m-1' type='button' iconElement='img' icon={coinIcon} theme={zapAmount === 50 ? 'primary' : 'muted'} text='50' />
        <Button onClick={() => setZapAmount(200)} className='m-1' type='button' iconElement='img' icon={coinStack} theme={zapAmount === 200 ? 'primary' : 'muted'} text='200' />
        <Button onClick={() => setZapAmount(1_000)} className='m-1' type='button' iconElement='img' icon={pileCoin} theme={zapAmount === 1_000 ? 'primary' : 'muted'} text='1K' />
        <Button onClick={() => setZapAmount(3_000)} className='m-1' type='button' iconElement='img' icon={moneyBag} theme={zapAmount === 3_000 ? 'primary' : 'muted'} text='3K' />
        <Button onClick={() => setZapAmount(5_000)} className='m-1' type='button' iconElement='img' icon={chestIcon} theme={zapAmount === 5_000 ? 'primary' : 'muted'} text='5K' />
      </div>

      <div className='flex justify-center'>
        <Input
          type='text' onChange={handleCustomAmount} value={zapAmount}
          className='box-shadow:none max-w-28 rounded-none border-0 border-b-4 p-0.5 text-center !text-2xl font-bold !ring-0 dark:bg-transparent'
        />
      </div>

      <div className='w-full'>
        <Input onChange={e => setZapComment(e.target.value)} type='text' placeholder={intl.formatMessage(messages.zap_commentPlaceholder)} />
      </div>

      <Button className='m-auto w-auto' type='submit' theme='primary' icon={require('@tabler/icons/outline/bolt.svg')} text={renderZapButtonText()} disabled={zapAmount < 1 ? true : false} />
      <HStack justifyContent='center' space={2}>
        <p className='text-sm'>To suport Ditto, 'amount' sats will deducted</p>
        <a className='flex gap-2' href='/'>
          <img src={questionIcon} className='w-4' alt='' />
        </a>
      </HStack>
    </Stack>
  );
};

export default ZapPayRequestForm;
