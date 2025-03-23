import arrowBarDownIcon from '@tabler/icons/outline/arrow-bar-down.svg';
import arrowBarUpIcon from '@tabler/icons/outline/arrow-bar-up.svg';
import questionIcon from '@tabler/icons/outline/question-mark.svg';
import { FormattedDate, defineMessages, useIntl } from 'react-intl';

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
});

const groupByDate = (transactions: { amount: number; created_at: number; direction: 'in' | 'out' }[]) => {
  return transactions.reduce((acc, transaction) => {
    const dateKey = new Date(transaction.created_at * 1000).toDateString(); // Agrupa pelo dia
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, typeof transactions>);
};

const TransactionItem = ({ transaction, hasDivider = true }: { transaction: { amount: number; created_at: number; direction: 'in' | 'out' }; hasDivider?: boolean}) => {
  const intl = useIntl();
  let icon, type, messageColor;
  const { direction, amount, created_at } = transaction;

  const formattedTime = (
    <FormattedDate value={new Date(created_at * 1000)} hour12 hour='numeric' minute='2-digit' />
  );

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
            <Text size='lg'>{type}</Text>
          </Stack>
        </HStack>

        <HStack space={2} alignItems='center'>
          <Stack alignItems='end' justifyContent='center'>
            <Text size='lg'>{intl.formatMessage(messages.amount, { amount })}</Text>
            <Text theme='muted' size='xs'>{formattedTime}</Text>
          </Stack>
        </HStack>
      </HStack>
      {hasDivider && <Divider />}
    </Stack>
  );
};

interface ITransactions {
  limit?: number;
}

const Transactions = ({ limit = 6 }: ITransactions) => {
  const { account } = useOwnAccount();
  const { transactions } = useTransactions();

  if (!account) {
    return null;
  }

  if (!transactions) {
    return <Spinner withText={false} />;
  }

  const groupedTransactions = groupByDate(transactions.slice(0, limit));

  return (
    <Stack className='rounded-lg px-3' alignItems='center' space={4}>
      <Stack space={6} className='w-full'>
        {Object.entries(groupedTransactions).map(([date, transactions]) => (
          <Stack key={date} space={2}>
            <Text size='lg' theme='muted'>
              <FormattedDate value={new Date(date)} year='numeric' month='short' day='2-digit' />
            </Text>
            {transactions.map((transaction, index) => (
              <TransactionItem key={transaction.created_at} transaction={transaction} hasDivider={transactions.length - 1 !== index} />
            ))}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default Transactions;