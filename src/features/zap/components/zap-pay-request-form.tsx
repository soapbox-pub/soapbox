import React, { useEffect, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { zap } from 'soapbox/actions/interactions';
import { openModal, closeModal } from 'soapbox/actions/modals';
import useZapSplit from 'soapbox/api/hooks/zap-split/useZapSplit';
import chestIcon from 'soapbox/assets/icons/chest.png';
import coinStack from 'soapbox/assets/icons/coin-stack.png';
import coinIcon from 'soapbox/assets/icons/coin.png';
import moneyBag from 'soapbox/assets/icons/money-bag.png';
import pileCoin from 'soapbox/assets/icons/pile-coin.png';
import DisplayNameInline from 'soapbox/components/display-name-inline';
import { Stack, Button, Input, Avatar, Text } from 'soapbox/components/ui';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import IconButton from 'soapbox/components/ui/icon-button/icon-button';
import { useAppDispatch } from 'soapbox/hooks';

import ZapButton from './zap-button/zap-button';

import type {  Account as AccountEntity, Status as StatusEntity   } from 'soapbox/types/entities';

const ZAP_PRESETS = [
  { amount: 50, icon: coinIcon },
  { amount: 200, icon: coinStack },
  { amount: 1_000, icon: pileCoin },
  { amount: 3_000, icon: moneyBag },
  { amount: 5_000, icon: chestIcon },
];

interface IZapPayRequestForm {
  status?: StatusEntity;
  account: AccountEntity;
  onClose?(): void;
}

const closeIcon = require('@tabler/icons/outline/x.svg');

const messages = defineMessages({
  zap_button_rounded: { id: 'zap.button.text.rounded', defaultMessage: 'Zap {amount}K sats' },
  zap_button: { id: 'zap.button.text.raw', defaultMessage: 'Zap {amount} sats' },
  zap_commentPlaceholder: { id: 'zap.comment_input.placeholder', defaultMessage: 'Optional comment' },
});

const ZapPayRequestForm = ({ account, status, onClose }: IZapPayRequestForm) => {

  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [zapComment, setZapComment] = useState('');
  const [zapAmount, setZapAmount] = useState(50); // amount in millisatoshi
  const { zapArrays, zapSplitData, receiveAmount } = useZapSplit(status, account);
  const splitValues = zapSplitData.splitValues;
  const hasZapSplit = zapArrays.length > 0;

  const handleSubmit = async (e?: React.FormEvent<Element>) => {
    e?.preventDefault();
    const zapSplitAccounts = zapArrays.filter(zapData => zapData.account.id !== account.id);
    const splitData = { hasZapSplit, zapSplitAccounts, splitValues };

    const invoice = hasZapSplit ? await dispatch(zap(account, status, zapSplitData.receiveAmount * 1000, zapComment)) : await dispatch(zap(account, status, zapAmount * 1000, zapComment));
    // If invoice is undefined it means the user has paid through his extension
    // In this case, we simply close the modal

    if (!invoice) {
      dispatch(closeModal('ZAP_PAY_REQUEST'));
      // Dispatch the adm account
      if (zapSplitAccounts.length > 0) {
        dispatch(openModal('ZAP_SPLIT', { zapSplitAccounts, splitValues }));
      }
      return;
    }
    // open QR code modal
    dispatch(closeModal('ZAP_PAY_REQUEST'));
    dispatch(openModal('ZAP_INVOICE', { account, invoice, splitData }));
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

  useEffect(() => {
    receiveAmount(zapAmount);
  }, [zapAmount, zapArrays]);

  return (
    <Stack space={4} element='form' onSubmit={handleSubmit} justifyContent='center' alignItems='center' className='relative'>
      <Stack space={2} justifyContent='center' alignItems='center' >
        <IconButton
          src={closeIcon}
          onClick={onClose}
          className='absolute right-[-1%] top-[-2%] text-gray-500 hover:text-gray-700 rtl:rotate-180 dark:text-gray-300 dark:hover:text-gray-200'
        />

        <Text weight='semibold'>
          <FormattedMessage id='zap.send_to' defaultMessage='Send zaps to {target}' values={{ target: account.display_name }} />
        </Text>
        <Avatar src={account.avatar} size={50} />
        <DisplayNameInline account={account} />
      </Stack>

      <div className='flex w-full justify-center'>
        {ZAP_PRESETS.map(({ amount, icon }) => (
          <ZapButton
            onClick={() => setZapAmount(amount)}
            className='m-0.5 sm:m-1'
            selected={zapAmount === amount}
            icon={icon}
            amount={amount}
          />
        ))}
      </div>

      <Stack space={2}>
        <div className='relative flex items-end justify-center gap-4'>
          <Input
            type='text' onChange={handleCustomAmount} value={zapAmount}
            className='box-shadow:none max-w-20 rounded-none border-0 border-b-4 p-0 text-center !text-2xl font-bold !ring-0 sm:max-w-28 sm:p-0.5 sm:!text-4xl dark:bg-transparent'
          />
          {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
          {hasZapSplit && <p className='absolute right-0 font-bold sm:-right-6 sm:text-xl'>sats</p>}
        </div>

        {hasZapSplit && <span className='flex justify-center text-xs'>
          <FormattedMessage
            id='zap.split_message.receiver'
            defaultMessage='{receiver} will receive {amountReceiver} sats*' values={{ receiver: account.display_name, amountReceiver: zapSplitData.receiveAmount }}
          />
        </span>}

      </Stack>

      <div className='w-full'>
        <Input onChange={e => setZapComment(e.target.value)} type='text' placeholder={intl.formatMessage(messages.zap_commentPlaceholder)} />
      </div>

      {hasZapSplit ? <Stack space={2}>

        <Button className='m-auto w-auto' type='submit' theme='primary' icon={require('@tabler/icons/outline/bolt.svg')} text={'Zap sats'} disabled={zapAmount < 1 ? true : false} />

        <div className='flex items-center justify-center gap-2 sm:gap-4'>
          <span className='text-[10px] sm:text-xs'>
            <FormattedMessage
              id='zap.split_message.deducted'
              defaultMessage='{amountDeducted} sats will deducted*' values={{ instance: account.display_name, amountDeducted: zapSplitData.splitAmount }}
            />
          </span>

          <Link to={'/'} className='text-xs underline'>
            <SvgIcon src={require('@tabler/icons/outline/info-square-rounded.svg')} className='w-4' alt='info-square-rounded' />
          </Link>

        </div>
      </Stack> : <Button className='m-auto w-auto' type='submit' theme='primary' icon={require('@tabler/icons/outline/bolt.svg')} text={renderZapButtonText()} disabled={zapAmount < 1 ? true : false} />}

    </Stack>
  );
};

export default ZapPayRequestForm;
