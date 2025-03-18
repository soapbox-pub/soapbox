// import IconButton from 'soapbox/components/ui/icon-button.tsx';
import arrowBackIcon from '@tabler/icons/outline/arrow-back-up.svg';
import cancelIcon from '@tabler/icons/outline/cancel.svg';
import withdrawIcon from '@tabler/icons/outline/cash.svg';
import mIcon from '@tabler/icons/outline/circle-dotted-letter-m.svg';
import creditCardPayIcon from '@tabler/icons/outline/credit-card-pay.svg';
import libraryPlusIcon from '@tabler/icons/outline/library-plus.svg';
import exchangeIcon from '@tabler/icons/outline/transfer.svg';
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
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { WalletData, baseWalletSchema, quoteShema } from 'soapbox/schemas/wallet.ts';
import toast from 'soapbox/toast.tsx';



const messages = defineMessages({
  balance: { id: 'wallet.balance.cashu', defaultMessage: '{amount} cashus' },
  withdraw: { id: 'wallet.balance.withdraw_button', defaultMessage: 'Withdraw' },
  exchange: { id: 'wallet.balance.exchange_button', defaultMessage: 'Exchange' },
  mint: { id: 'wallet.balance.mint_button', defaultMessage: 'Mint' },
  paidMessage: { id: 'wallet.balance.mint.paid_message', defaultMessage: 'Your mint was successful, and your cashus are now in your balance. Enjoy!' },
  unpaidMessage: { id: 'wallet.balance.mint.unpaid_message', defaultMessage: 'Your mint is still unpaid. Complete the payment to receive your cashus.' },
});

interface AmountProps {
  amount: number;
  onMintClick: () => void;
}

interface NewMintProps {
  list: string[];
  onBack: () => void;
  onChange: () => void;
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

  return (
    <Stack alignItems='center' space={4}>
      <Text theme='default' size='3xl'>
        {intl.formatMessage(messages.balance, { amount })}
      </Text>

      <div className='w-full'>
        <Divider />
      </div>

      <HStack space={2}>
        <Button icon={withdrawIcon} theme='secondary' text={intl.formatMessage(messages.withdraw)} />
        <Button icon={exchangeIcon} theme='secondary' text={intl.formatMessage(messages.exchange)} />
        <Button icon={libraryPlusIcon} theme='primary' onClick={onMintClick} text={intl.formatMessage(messages.mint)} />
      </HStack>
    </Stack>
  );
};

const NewMint = ({ onBack, list, onChange }: NewMintProps) => {
  const [mintAmount, setMintAmount] = useState('');
  const [quote, setQuote] = useState(() => {
    const storedQuote = localStorage.getItem('soapbox:wallet:quote');
    return storedQuote ? JSON.parse(storedQuote) : undefined;
  });
  const [mintName, setMintName] = useState(list[0]);
  const [hasProcessedQuote, setHasProcessedQuote] = useState(false);
  const [currentState, setCurrentState] = useState<'loading' | 'paid' | 'default'>('default');
  const api = useApi();
  const intl = useIntl();

  const handleClean = useCallback(() => {
    setQuote(undefined);
    setMintAmount('');
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
        onChange();
        onBack();
        handleClean();
        setCurrentState('default');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentState('loading');
    if (!quote) {
      try {
        const response = await api.post('/api/v1/ditto/cashu/quote', { mint: mintName, amount: Number(mintAmount) });
        const newQuote = quoteShema.parse(await response.json());
        localStorage.setItem('soapbox:wallet:quote', JSON.stringify(newQuote));
        setQuote(newQuote);
        setHasProcessedQuote(true);
        if (!(await openExtension(newQuote.request))) checkQuoteStatus(newQuote.quote);
      } catch {
        toast.error('An error occurred');
      }
      setCurrentState('paid');
    } else {
      checkQuoteStatus(quote.quote);
    }
    // setHasProcessedQuote(true);
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
        if (invoice === undefined) {
          await checkQuoteStatus(quote.quote);
        }
        setHasProcessedQuote(true);
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
          <FormGroup labelText='Mint'>
            <SelectDropdown items={mintList} defaultValue={mintList[0]} onChange={handleSelectChange} />
          </FormGroup>
          <FormGroup labelText='Amount in sats'>
            <Input
              // aria-label='Amount in sats'
              placeholder='Amount'
              type='number'
              // name='amount'
              value={mintAmount}
              onChange={(e) => /^[0-9]*$/.test(e.target.value) && setMintAmount(e.target.value)}
              autoCapitalize='off'
              required
            />
          </FormGroup>
        </Stack>
          : <Stack space={3} justifyContent='center' alignItems='center'>
            {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
            <Text>
              Solta a carta garai tigr...
            </Text>

            <QRCode className='rounded-lg' value={quote.request} includeMargin />

            <CopyableInput value={quote.request} />

          </Stack>
        }

        <HStack grow space={2} justifyContent='center'>
          <Button icon={arrowBackIcon} theme='secondary' text='Back' onClick={onBack} />
          <Button icon={cancelIcon} theme='danger' text='Cancel' onClick={handleClean} />
          <Button icon={iconButton} type='submit' theme='primary' text={textButton} />
        </HStack>
      </Stack>
    </Form>
  );
};

const Balance = () => {
  const [amount, setAmount] = useState(0);
  const [mints, setMints] = useState<string[]>([]);
  const { account } = useOwnAccount();
  const [current, setCurrent] = useState<keyof typeof items>('balance');
  const api = useApi();

  const fetchWallet = async () => {
    try {
      const response = await api.get('/api/v1/ditto/cashu/wallet');
      const data: WalletData = await response.json();
      if (data) {
        const normalizedData = baseWalletSchema.parse(data);
        setMints([...normalizedData.mints]);
        setAmount(normalizedData.balance);
      }

    } catch (error) {
      toast.error('Wallet not found');
    }
  };

  const items = {
    balance: <Amount amount={amount} onMintClick={() => setCurrent('newMint')} />,
    newMint: <NewMint onBack={() => setCurrent('balance')} list={mints} onChange={fetchWallet} />,
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  if (!account) {
    return null;
  }

  return (
    <Stack className='rounded-lg border p-6' alignItems='center' space={4}>
      {items[current]}
    </Stack>
  );
};

export default Balance;