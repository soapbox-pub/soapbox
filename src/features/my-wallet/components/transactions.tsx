import withdrawIcon from '@tabler/icons/outline/cash.svg';
import moreIcon from '@tabler/icons/outline/dots-circle-horizontal.svg';
import infoIcon from '@tabler/icons/outline/info-circle.svg';
import questionIcon from '@tabler/icons/outline/question-mark.svg';
import exchangeIcon from '@tabler/icons/outline/transfer.svg';
import trendingDown from '@tabler/icons/outline/trending-down.svg';
import trendingUp from '@tabler/icons/outline/trending-up.svg';

// import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import Divider from 'soapbox/components/ui/divider.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';
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
  exchange: '!text-blue-600 dark:!text-blue-300',
  withdraw: '!text-orange-600 dark:!text-orange-300',
};

const capitaliza = (str: string) => {
  return str.charAt(0).toLocaleUpperCase() + str.slice(1);
};

const transaction = (e:  { type: string; amount: number; from?: string | null; to?: string | null; mint?: string | null; date: string }, lastElementIndex: number, index: number) => {

  const isLastElement = index === lastElementIndex;
  let icon, sla, messageColor:  typeof themes[keyof typeof themes] | undefined ;
  const { type, amount, date } = e;
  switch (type) {
    case 'received':
      icon = trendingUp;
      sla = e.from;
      messageColor = themes.success;
      break;
    case 'sent':
      icon = trendingDown;
      sla = e.to;
      messageColor = themes.danger;
      break;
    case 'exchanged':
    case 'withdrawn':
      icon = e.type === 'exchanged' ? exchangeIcon :  withdrawIcon;
      sla = e.mint || 'MoonFileMoney';
      messageColor =  e.type === 'exchanged' ? themes.exchange : themes.withdraw;
      break;
    default:
      messageColor = 'default';
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
              {sla}
            </Text>
            <Text theme='muted' size='xs'>
              {capitaliza(type)}
            </Text>
          </Stack>
        </HStack>

        <HStack space={2} alignItems='center'>
          <Stack alignItems='end' justifyContent='center'>
            <HStack space={1}>
              <Text size='lg'>
                {amount}
              </Text>
              <Text size='lg'>
                {/* sats  */}
              </Text>
            </HStack>
            <Text theme='muted' size='xs'>
              {date}
            </Text>
          </Stack>

          <IconButton src={infoIcon} theme='secondary' />
        </HStack>

      </HStack>
      {!isLastElement && (<Divider />) }
    </Stack>
  );
};

const eG = [
  {
    to: null,
    from: 'Patrick',
    type: 'received',
    mint: null,
    amount: 100,
    date: '02/11/24',
  },
  {
    to: 'Alex',
    from: null,
    type: 'sent',
    mint: null,
    amount: 50,
    date: '02/09/24',
  },
  {
    to: null,
    from: null,
    type: 'exchanged',
    mint: 'MoonFileMoney',
    amount: 200,
    date: '02/07/24',
  },
  {
    to: null,
    from: null,
    type: 'withdrawn',
    mint: 'MoonFileMoney',
    amount: 300,
    date: '02/05/24',
  },
];
const Transactions = () => {
  const { account } = useOwnAccount();

  if (!account) {
    return null;
  }

  const lastItem = eG.length - 1;

  return (
    <Stack className='rounded-lg p-3' alignItems='center' space={4}>

      <Stack space={2} className='w-full'>
        {eG.map((item, index) => {
          return transaction(item, lastItem, index);
        })}
      </Stack>

      <Button icon={moreIcon} theme='primary' >
        {/* More */}
      </Button>

    </Stack>
  );
};

export default Transactions;