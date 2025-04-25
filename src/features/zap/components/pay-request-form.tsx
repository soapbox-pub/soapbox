import boltIcon from '@tabler/icons/outline/bolt.svg';
import infoSquareRoundedIcon from '@tabler/icons/outline/info-square-rounded.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import { useEffect, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { zap } from 'soapbox/actions/interactions.ts';
import { openModal, closeModal } from 'soapbox/actions/modals.ts';
import useZapSplit from 'soapbox/api/hooks/zap-split/useZapSplit.ts';
import chestIcon from 'soapbox/assets/icons/chest.png';
import coinStack from 'soapbox/assets/icons/coin-stack.png';
import coinIcon from 'soapbox/assets/icons/coin.png';
import moneyBag from 'soapbox/assets/icons/money-bag.png';
import pileCoin from 'soapbox/assets/icons/pile-coin.png';
import DisplayNameInline from 'soapbox/components/display-name-inline.tsx';
import Avatar from 'soapbox/components/ui/avatar.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useZapCashuRequest } from 'soapbox/features/wallet/hooks/useHooks.ts';
import { usePaymentMethod } from 'soapbox/features/zap/usePaymentMethod.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { emojifyText } from 'soapbox/utils/emojify.tsx';

import PaymentButton from './zap-button/payment-button.tsx';

import type {  Account as AccountEntity, Status as StatusEntity   } from 'soapbox/types/entities.ts';

const ZAP_PRESETS = [
  { buttonAmount: 50, icon: coinIcon },
  { buttonAmount: 200, icon: coinStack },
  { buttonAmount: 1_000, icon: pileCoin },
  { buttonAmount: 3_000, icon: moneyBag },
  { buttonAmount: 5_000, icon: chestIcon },
];

interface IPayRequestForm {
  status?: StatusEntity;
  account: AccountEntity;
  onClose?(): void;
}

const messages = defineMessages({
  button_rounded: { id: 'zap.button.text.rounded', defaultMessage: 'Zap {amount}K sats' },
  button: { id: 'payment_method.button.text.raw', defaultMessage: 'Zap {amount} sats' },
  commentPlaceholder: { id: 'payment_method.comment_input.placeholder', defaultMessage: 'Optional comment' },
});

const PayRequestForm = ({ account, status, onClose }: IPayRequestForm) => {

  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [comment, setComment] = useState('');
  const [amount, setAmount] = useState(50);
  const { zapArrays, zapSplitData, receiveAmount } = useZapSplit(status, account);
  const splitValues = zapSplitData.splitValues;
  const { method: paymentMethod, changeMethod } = usePaymentMethod();
  const isCashu = paymentMethod === 'cashu';
  const hasZapSplit = zapArrays.length > 0 && !isCashu;
  const { zapCashu } = useZapCashuRequest();

  const handleSubmit = async (e?: React.FormEvent<Element>) => {
    e?.preventDefault();
    const zapSplitAccounts = zapArrays.filter(zapData => zapData.account.id !== account.id);
    const splitData = { hasZapSplit, zapSplitAccounts, splitValues };

    if (isCashu) {
      await zapCashu({ account, amount, comment, status });
      dispatch(closeModal('PAY_REQUEST'));
      return;
    }

    const invoice = hasZapSplit
      ? await dispatch(zap(account, status, zapSplitData.receiveAmount * 1000, comment))
      : await dispatch(zap(account, status, amount * 1000, comment));

    if (!invoice) {
      dispatch(closeModal('PAY_REQUEST'));

      if (zapSplitAccounts.length > 0) {
        dispatch(openModal('ZAP_SPLIT', { zapSplitAccounts, splitValues }));
      }
      return;
    }

    dispatch(closeModal('PAY_REQUEST'));
    dispatch(openModal('ZAP_INVOICE', { account, invoice, splitData }));
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    e?.preventDefault();
    const inputAmount = e.target.value.replace(/[^0-9]/g, '');
    const maxSendable = 250000000;

    if (maxSendable * 1000 > Number(inputAmount) && !isCashu) {
      setAmount(Number(inputAmount));
    } else if (maxSendable > Number(inputAmount)) {
      setAmount(Number(inputAmount));
    }
  };

  const renderPaymentButtonText = () => {
    if (amount >= 1000) {
      return intl.formatMessage(messages.button_rounded, { amount: Math.round((amount / 1000) * 10) / 10 });
    }
    return intl.formatMessage(messages.button, { amount: amount });
  };

  useEffect(() => {
    receiveAmount(amount);
  }, [amount, zapArrays]);

  return (
    <Stack space={4} element='form' onSubmit={handleSubmit} justifyContent='center' alignItems='center' className='relative'>
      <Stack space={2} justifyContent='center' alignItems='center'>
        <HStack className='absolute right-[-1%] top-[-2%] w-full'>
          <div className='absolute left-[-1%] top-[-2%] flex items-center gap-2'>
            <button
              type='button'
              className={`flex size-8 items-center justify-center rounded-full transition ${
                paymentMethod === 'lightning'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800'
              }`}
              onClick={() => changeMethod('lightning')}
              title={intl.formatMessage({ id: 'payment_method.lightning', defaultMessage: 'Lightning' })}
            >
              <span role='img' aria-label={intl.formatMessage({ id: 'emoji.lightning', defaultMessage: 'Lightning' })} className='text-lg'>⚡</span> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
            </button>
            <button
              type='button'
              className={`flex size-8 items-center justify-center rounded-full transition ${
                paymentMethod === 'cashu'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800'
              }`}
              onClick={() => changeMethod('cashu')}
              title={intl.formatMessage({ id: 'payment_method.cashu', defaultMessage: 'Cashu' })}
            >
              <span role='img' aria-label={intl.formatMessage({ id: 'emoji.cashu', defaultMessage: 'Cashu' })} className='text-lg'>💰</span> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
            </button>
          </div>

          <IconButton
            src={xIcon}
            onClick={onClose}
            className='absolute right-[-1%] top-[-2%] text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 rtl:rotate-180'
          />
        </HStack>

        <Text weight='semibold'>
          <FormattedMessage
            id='payment_method.send_to'
            defaultMessage='Send sats via {method} to {target}'
            values={{
              target: emojifyText(account.display_name, account.emojis),
              method: paymentMethod,
            }}
          />
        </Text>
        {zapArrays.length > 0 && isCashu && (
          <Text size='xs' theme='muted' className='text-center'>
            <FormattedMessage
              id='payment_method.cashu.split_disabled'
              defaultMessage='Switch to ⚡ for splits'
            />
          </Text>
        )}
        <Avatar src={account.avatar} size={50} />
        <DisplayNameInline account={account} />
      </Stack>

      <div className='flex w-full justify-center'>
        {ZAP_PRESETS.map(({ buttonAmount, icon }) => (
          <PaymentButton
            onClick={() => setAmount(buttonAmount)}
            className='m-0.5 sm:m-1'
            selected={buttonAmount === amount}
            icon={icon}
            amount={buttonAmount}
          />
        ))}
      </div>

      <Stack space={2}>
        <div className='relative flex items-end justify-center gap-4'>
          <Input
            type='text' onChange={handleCustomAmount} value={amount}
            className='max-w-20 rounded-none border-0 border-b-4 p-0 text-center !text-2xl font-bold shadow-none !ring-0 dark:bg-transparent sm:max-w-28 sm:p-0.5 sm:!text-4xl'
          />
          {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
          {hasZapSplit && <p className='absolute right-0 font-bold sm:-right-6 sm:text-xl'>
            {intl.formatMessage({ id: 'payment_method.unit', defaultMessage: 'sats' })}
          </p>}
        </div>

        {hasZapSplit && (
          <span className='flex justify-center text-xs'>
            <FormattedMessage
              id='zap.split_message.receiver'
              defaultMessage='{receiver} will receive {amountReceiver} sats*'
              values={{ receiver: emojifyText(account.display_name, account.emojis), amountReceiver: zapSplitData.receiveAmount }}
            />
          </span>
        )}

      </Stack>

      <div className='w-full'>
        <Input onChange={e => setComment(e.target.value)} type='text' placeholder={intl.formatMessage(messages.commentPlaceholder)} />
      </div>

      {hasZapSplit ? <Stack space={2}>

        <Button className='m-auto w-auto' type='submit' theme='primary' icon={boltIcon} text={intl.formatMessage({ id: 'payment_method.button.zap_sats', defaultMessage: 'Zap sats' })} disabled={amount < 1 ? true : false} />

        <div className='flex items-center justify-center gap-2 sm:gap-4'>
          <span className='text-[10px] sm:text-xs'>
            <FormattedMessage
              id='payment_method.split_message.deducted'
              defaultMessage='{amountDeducted} sats will deducted*'
              values={{ instance: emojifyText(account.display_name, account.emojis), amountDeducted: zapSplitData.splitAmount }}
            />
          </span>

          <Link to={'/'} className='text-xs underline'>
            <SvgIcon src={infoSquareRoundedIcon} className='w-4' alt='info-square-rounded' />
          </Link>

        </div>
      </Stack> : <Button className='m-auto w-auto' type='submit' theme='primary' icon={boltIcon} text={renderPaymentButtonText()} disabled={amount < 1 ? true : false} />}

    </Stack>
  );
};

export default PayRequestForm;