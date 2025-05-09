import cancelIcon from '@tabler/icons/outline/cancel.svg';
import withdrawIcon from '@tabler/icons/outline/cash.svg';
import mIcon from '@tabler/icons/outline/circle-dotted-letter-m.svg';
import creditCardPayIcon from '@tabler/icons/outline/credit-card-pay.svg';
import libraryPlusIcon from '@tabler/icons/outline/library-plus.svg';
import QRCode from 'qrcode.react';
import { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import CopyableInput from 'soapbox/components/copyable-input.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import Divider from 'soapbox/components/ui/divider.tsx';
import FormGroup from 'soapbox/components/ui/form-group.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { SelectDropdown } from 'soapbox/features/forms/index.tsx';
import { useTransactions, useWallet } from 'soapbox/features/wallet/hooks/useHooks.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { Quote, quoteSchema } from 'soapbox/schemas/wallet.ts';
import toast from 'soapbox/toast.tsx';

import WithdrawModal from './withdraw-modal.tsx';


const messages = defineMessages({
  amount: { id: 'wallet.balance.mint.amount', defaultMessage: 'Amount in sats' },
  cancel: { id: 'wallet.button.cancel', defaultMessage: 'Cancel' },
  balance: { id: 'wallet.sats', defaultMessage: '{amount} sats' },
  withdraw: { id: 'wallet.button.withdraw', defaultMessage: 'Withdraw' },
  mint: { id: 'wallet.button.mint', defaultMessage: 'Mint' },
  payment: { id: 'wallet.balance.mint.payment', defaultMessage: 'Make the payment to complete:' },
  paidMessage: { id: 'wallet.balance.mint.paid_message', defaultMessage: 'Your mint was successful, and your sats are now in your balance. Enjoy!' },
  unpaidMessage: { id: 'wallet.balance.mint.unpaid_message', defaultMessage: 'Your mint is still unpaid. Complete the payment to receive your sats.' },
  expired: { id: 'wallet.balance.expired', defaultMessage: 'Expired' },
});

interface AmountProps {
  amount: number;
  onMintClick: () => void;
}

interface NewMintProps {
  list: string[];
  onBack: () => void;
}

const openExtension = async (invoice: string) => {
  try {
    await window.webln?.enable();
    await window.webln?.sendPayment(invoice);
    return undefined;
  } catch (e) {
    return invoice;
  }
};

const Amount = ({ amount, onMintClick }: AmountProps) => {
  const intl = useIntl();
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const handleWithdrawClick = () => {
    setWithdrawModalOpen(true);
  };

  const handleCloseWithdrawModal = () => {
    setWithdrawModalOpen(false);
  };

  return (
    <Stack alignItems='center' space={4} className='w-4/5'>
      <Text theme='default' weight='semibold' size='3xl'>
        {intl.formatMessage(messages.balance, { amount })}
      </Text>

      <div className='w-full'>
        <Divider />
      </div>

      <HStack space={2}>
        <Button
          icon={withdrawIcon}
          theme='secondary'
          text={intl.formatMessage(messages.withdraw)}
          onClick={handleWithdrawClick}
          className='withdraw-button'
        />
        <Button
          icon={libraryPlusIcon}
          theme='primary'
          onClick={onMintClick}
          text={intl.formatMessage(messages.mint)}
        />
      </HStack>

      {isWithdrawModalOpen && <WithdrawModal onClose={handleCloseWithdrawModal} />}
    </Stack>
  );
};

const NewMint = ({ onBack, list }: NewMintProps) => {
  const [mintAmount, setMintAmount] = useState('');
  const [quote, setQuote] = useState<Quote | undefined>(() => {
    const storedQuote = localStorage.getItem('soapbox:wallet:quote');
    return storedQuote ? JSON.parse(storedQuote) : undefined;
  });
  const [mintName, setMintName] = useState(list[0]);
  const [hasProcessedQuote, setHasProcessedQuote] = useState(false);
  const [currentState, setCurrentState] = useState<'loading' | 'paid' | 'default'>('default');
  const api = useApi();
  const intl = useIntl();
  const { getWallet } = useWallet();
  const { refetch } = useTransactions();

  const now = Math.floor(Date.now() / 1000);

  const handleClean = useCallback(() => {
    onBack();
    setQuote(undefined);
    setMintAmount('');
    setCurrentState('default');
    localStorage.removeItem('soapbox:wallet:quote');
  }, []);

  const checkQuoteStatus = async (quoteId: string): Promise<void> => {
    try {
      const response = await api.post(`/api/v1/ditto/cashu/mint/${quoteId}`);
      const data = await response.json();
      if (data.state !== 'ISSUED') {
        toast.error(intl.formatMessage(messages.unpaidMessage));
        setCurrentState('paid');
      } else {
        toast.success(intl.formatMessage(messages.paidMessage));
        onBack();
        getWallet();
        refetch();
        handleClean();
        setCurrentState('default');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentState('loading');
    if (!quote) {
      try {
        const response = await api.post('/api/v1/ditto/cashu/quote', { mint: mintName, amount: Number(mintAmount) });
        const newQuote = quoteSchema.parse(await response.json());
        localStorage.setItem('soapbox:wallet:quote', JSON.stringify(newQuote));
        setQuote(newQuote);
        setHasProcessedQuote(true);
        if (!(await openExtension(newQuote.request))) checkQuoteStatus(newQuote.quote);
      } catch (error) {
        console.error('Mint Error:', error);
        toast.error('An error occurred while processing the mint.');
      }
      setCurrentState('paid');
    } else {
      if (now > quote.expiry) {
        toast.error(intl.formatMessage(messages.expired));
        handleClean();
      } else {
        checkQuoteStatus(quote.quote);
      }
    }
  };

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const index = Number(e.target.value);
    const item = list[index];
    setMintName(item);
  };

  useEffect(() => {
    const processQuote = async () => {
      if (quote && !hasProcessedQuote) {
        const invoice = await openExtension(quote.request);
        if (invoice === undefined && now < quote.expiry) {
          await checkQuoteStatus(quote.quote);
        }
        if (now > quote.expiry) {
          handleClean();
          toast.error(intl.formatMessage(messages.expired));
        } else {
          setCurrentState('paid');
          setHasProcessedQuote(true);
        }
      }
    };

    processQuote();
  }, [quote, hasProcessedQuote]);

  const mintList: Record<string, string> = Object.fromEntries(list.map((item, index) => [`${index}`, item]));

  const buttonState = {
    loading: {
      textButton: 'Loading...',
      iconButton: '',
    },
    paid: {
      textButton: 'Mint paid',
      iconButton: creditCardPayIcon,
    },
    default: {
      textButton: 'Mint',
      iconButton: mIcon,
    },
  };

  const { textButton, iconButton } = buttonState[currentState];
  return (
    <Form onSubmit={handleSubmit}>
      <Stack space={6}>
        {!quote ? <Stack space={2}>
          <FormGroup labelText='Mint URL'>
            <SelectDropdown items={mintList} defaultValue={mintList[0]} onChange={handleSelectChange} />
          </FormGroup>
          <FormGroup labelText={intl.formatMessage(messages.amount)}>
            <Input
              placeholder='Amount'
              type='number'
              value={mintAmount}
              onChange={(e) => /^[0-9]*$/.test(e.target.value) && setMintAmount(e.target.value)}
              autoCapitalize='off'
              required
            />
          </FormGroup>
        </Stack>
          : <Stack space={3} justifyContent='center' alignItems='center'>
            <Text>
              {intl.formatMessage(messages.payment)}
            </Text>

            <QRCode className='rounded-lg' value={quote.request} includeMargin />

            <CopyableInput value={quote.request} />

          </Stack>
        }

        <HStack grow space={2} justifyContent='center'>
          <Button icon={cancelIcon} theme='danger' text={intl.formatMessage(messages.cancel)} onClick={handleClean} />
          <Button icon={iconButton} type='submit' theme='primary' text={textButton} />
        </HStack>
      </Stack>
    </Form>
  );
};

const Balance = () => {
  const { walletData } = useWallet();
  const [amount, setAmount] = useState(0);
  const [mints, setMints] = useState<string[]>([]);
  const { account } = useOwnAccount();
  const [current, setCurrent] = useState<keyof typeof items>('balance');

  const items = {
    balance: <Amount amount={amount} onMintClick={() => setCurrent('newMint')} />,
    newMint: <NewMint onBack={() => setCurrent('balance')} list={mints} />,
  };

  useEffect(
    () => {
      if (walletData){
        setMints([...walletData.mints]);
        setAmount(walletData.balance);
      }
    }, [walletData],
  );

  if (!account) {
    return null;
  }

  return (<>
    {items[current]}
  </>
  );
};

export default Balance;