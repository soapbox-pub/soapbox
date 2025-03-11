// import IconButton from 'soapbox/components/ui/icon-button.tsx';
import cancelIcon from '@tabler/icons/outline/cancel.svg';
import withdrawIcon from '@tabler/icons/outline/cash.svg';
import mIcon from '@tabler/icons/outline/circle-dotted-letter-m.svg';
import libraryPlusIcon from '@tabler/icons/outline/library-plus.svg';
import exchangeIcon from '@tabler/icons/outline/transfer.svg';
import QRCode from 'qrcode.react';
import { useState } from 'react';
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
import { Quote, WalletData, quoteShema } from 'soapbox/schemas/wallet.ts';
import toast from 'soapbox/toast.tsx';



const messages = defineMessages({
  balance: { id: 'my_wallet.balance.sats', defaultMessage: '{amount} sats' },
  withdraw: { id: 'my_wallet.balance.withdraw_button', defaultMessage: 'Withdraw' },
  exchange: { id: 'my_wallet.balance.exchange_button', defaultMessage: 'Exchange' },
  mint: { id: 'my_wallet.balance.mint_button', defaultMessage: 'Mint' },
});

interface AmountProps {
  amount: number;
  onMintClick: () => void;
}

interface NewMintProps {
  list: string[];
  onCancel: () => void;
}


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

const NewMint = ({ onCancel, list }: NewMintProps) => {
  const [mintAmount, setMintAmount] = useState('');
  const [quote, setQuote] = useState<Quote>();
  const [mintName, setMintName] = useState(list[0]);
  const api = useApi();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!quote) {
      const amountFormatted = Number(mintAmount);

      const mintQuote = {
        mint: mintName,
        amount: amountFormatted,
      };

      try {
        const response = await api.post('/api/v1/ditto/cashu/quote', mintQuote);

        const data = await response.json();

        const quote = quoteShema.parse(data);

        setQuote(quote);

      } catch (error) {
        toast.error('An error had occured'); // TO DO : create translated text
      }
      // } else {
      //   try {
      //     const response = await api.post(`/api/v1/ditto/cashu/mint/${quote.quote}`);

      //     // const data = await response.json();

    //   } catch (error) {
    //     toast.error('An error had occured'); // TO DO : create translated text
    //   }
    }
  };

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const index = Number(e.target.value);
    const item = list[index];

    setMintName(item);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value || /^[0-9]+$/.test(value)) {
      setMintAmount(value);
    }
  };

  const mintList: Record<string, string> = Object.fromEntries(list.map((item, index) => [`${index}`, item]));

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
              onChange={handleAmountChange}
              autoCapitalize='off'
              required
            />
          </FormGroup>
        </Stack>
          : <Stack space={3} justifyContent='center' alignItems='center'>
            {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
            <Text>
              Paga garai:
            </Text>

            <CopyableInput value={quote.request} />

            <QRCode className='rounded-lg' value={quote.request} includeMargin />

          </Stack>
        }

        <HStack grow space={2} justifyContent='center'>
          <Button icon={cancelIcon} theme='secondary' text='Cancel' onClick={onCancel} />
          <Button icon={mIcon} type='submit' theme='primary' text='Mint' />
        </HStack>
      </Stack>
    </Form>
  );
};

const Balance = ({ wallet }: { wallet: WalletData}) => {

  const amount = wallet.balance;
  const { account } = useOwnAccount();
  const [current, setCurrent] = useState<keyof typeof items>('balance');

  if (!account) {
    return null;
  }

  const items = {
    balance: <Amount amount={amount} onMintClick={() => setCurrent('newMint')} />,
    newMint: <NewMint onCancel={() => setCurrent('balance')} list={wallet.mints} />,
  };

  return (
    <Stack className='rounded-lg border p-6' alignItems='center' space={4}>
      {items[current]}
    </Stack>
  );
};

export default Balance;