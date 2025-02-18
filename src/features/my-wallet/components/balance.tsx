// import IconButton from 'soapbox/components/ui/icon-button.tsx';
import withddrawIcon from '@tabler/icons/outline/cash.svg';
import exchangeIcon from '@tabler/icons/outline/transfer.svg';
import { defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import Divider from 'soapbox/components/ui/divider.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';


const messages = defineMessages({
  balance: { id: 'my_wallet.balance.sats', defaultMessage: '{amount} sats' },
  withdraw: { id: 'my_wallet.balance.withdraw_button', defaultMessage: 'Withdraw' },
  exchange: { id: 'my_wallet.balance.exchange_button', defaultMessage: 'Exchange' },
});
interface IBalance {
  balance: number;
}

const Balance = ({ balance }: IBalance) => {
  const { account } = useOwnAccount();
  const intl = useIntl();

  if (!account) {
    return null;
  }

  return (
    <Stack className='rounded-lg border p-6' alignItems='center' space={4}>

      <Stack space={3}>
        <Text theme='default' size='3xl'>
          {intl.formatMessage(messages.balance, { amount: balance })}
        </Text>
      </Stack>

      <div className='w-full'>
        <Divider />
      </div>


      <HStack space={2}>
        <Button icon={withddrawIcon} theme='primary' text={intl.formatMessage(messages.withdraw)} />
        <Button icon={exchangeIcon} theme='secondary' text={intl.formatMessage(messages.exchange)} />
      </HStack>
    </Stack>
  );
};

export default Balance;