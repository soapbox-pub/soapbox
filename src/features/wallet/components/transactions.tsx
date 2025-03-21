import arrowBarDownIcon from '@tabler/icons/outline/arrow-bar-down.svg';
import arrowBarUpIcon from '@tabler/icons/outline/arrow-bar-up.svg';
import moreIcon from '@tabler/icons/outline/dots-circle-horizontal.svg';
import questionIcon from '@tabler/icons/outline/question-mark.svg';
import { FormattedDate, defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import Divider from 'soapbox/components/ui/divider.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useTransactions } from 'soapbox/features/zap/hooks/useHooks.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';

const themes = {
  default: '!text-gray-900 dark:!text-gray-100',
  danger: '!text-danger-600',
  primary: '!text-primary-600 dark:!text-accent-blue',
  muted: '!text-gray-700 dark:!text-gray-600',
  subtle: '!text-gray-400 dark:!text-gray-500',
  success: '!text-success-600',
  inherit: '!text-inherit',
  white: '!text-white',
  withdraw: '!text-orange-600 dark:!text-orange-300',
};

const messages = defineMessages({
  amount: { id: 'wallet.sats', defaultMessage: '{amount} sats' },
  more: { id: 'wallet.transactions.more', defaultMessage: 'More' },
});

const TransactionItem = (e:  { amount: number; created_at: number ; direction: 'in' | 'out' }, lastElementIndex: number, index: number) => {
  const intl = useIntl();
  const isLastElement = index === lastElementIndex;
  let icon, type, messageColor;
  const { direction, amount, created_at } = e;

  const formattedDate = <FormattedDate value={new Date(created_at * 1000)} hour12 year='numeric' month='short' day='2-digit' hour='numeric' minute='2-digit' />;

  switch (direction) {
    case 'in':
      icon = arrowBarDownIcon;
      type = 'Received';
      messageColor = themes.success;
      break;
    case 'out':
      icon = arrowBarUpIcon;
      type = 'Sent';
      messageColor = themes.danger;
      break;
    default:
      messageColor = 'default';
      type = 'Unknown';
      icon = questionIcon;
  }

  return (
    <Stack space={2}>
      <HStack space={4} alignItems='center' justifyContent='between'>

        <HStack space={4}>
          <div className='rounded-lg border-transparent bg-primary-100 p-3 text-primary-500 hover:bg-primary-50 focus:bg-primary-100 dark:bg-primary-800 dark:text-primary-200 dark:hover:bg-primary-700 dark:focus:bg-primary-800'>
            <SvgIcon src={icon} className={messageColor} />
          </div>

          <Stack justifyContent='center'>
            <Text size='lg'>
              {type}
            </Text>
          </Stack>
        </HStack>

        <HStack space={2} alignItems='center'>
          <Stack alignItems='end' justifyContent='center'>
            <Text size='lg'>
              {intl.formatMessage(messages.amount, { amount: amount })}
            </Text>
            <Text theme='muted' size='xs'>
              {formattedDate}
            </Text>
          </Stack>

          {/* <IconButton src={infoIcon} theme='secondary' /> */}
        </HStack>

      </HStack>
      {!isLastElement && (<Divider />) }
    </Stack>
  );
};

const Transactions = () => {
  const intl = useIntl();
  const { account } = useOwnAccount();
  const { transactions } = useTransactions();

  if (!account) {
    return null;
  }

  return (
    <Stack className='rounded-lg p-3' alignItems='center' space={4}>

      <Stack space={2} className='w-full'>
        {transactions ? transactions.slice(0, 4).map((item, index) => TransactionItem(item, 3, index)) : <Spinner withText={false} />}
      </Stack>

      <Button icon={moreIcon} theme='primary' >
        {intl.formatMessage(messages.more)}
      </Button>

    </Stack>
  );
};

export default Transactions;