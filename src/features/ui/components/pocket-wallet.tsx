import arrowsDiagonalIcon from '@tabler/icons/outline/arrows-diagonal-2.svg';
import arrowsDiagonalMinimizeIcon from '@tabler/icons/outline/arrows-diagonal-minimize.svg';
import eyeClosedIcon from '@tabler/icons/outline/eye-closed.svg';
import eyeIcon from '@tabler/icons/outline/eye.svg';
import walletIcon from '@tabler/icons/outline/wallet.svg';
import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';


import Button from 'soapbox/components/ui/button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Balance from 'soapbox/features/wallet/components/balance.tsx';
import { useWallet } from 'soapbox/features/wallet/hooks/useHooks.ts';

const messages = defineMessages({
  wallet: { id: 'wallet.title', defaultMessage: 'Wallet' },
  balance: { id: 'wallet.sats', defaultMessage: '{amount} sats' },
  withdraw: { id: 'wallet.button.withdraw', defaultMessage: 'Withdraw' },
  mint: { id: 'wallet.button.mint', defaultMessage: 'Mint' },
});

const PocketWallet = () => {
  const intl = useIntl();
  const { walletData } = useWallet();

  const [expanded, setExpanded] = useState(false);
  const [eyeClosed, setEyeClosed] = useState(() => {
    const storedData = localStorage.getItem('soapbox:wallet:eye');
    return storedData ? JSON.parse(storedData) : false;
  });

  useEffect(() => {
    localStorage.setItem('soapbox:wallet:eye', JSON.stringify(eyeClosed));
  }, [eyeClosed]);

  if (!walletData) {
    return null;
  }

  return (
    <Stack className='rounded-lg border p-2 px-4 black:border-gray-500 dark:border-gray-500' alignItems='center' space={4}>
      <HStack className='w-full' justifyContent='between' alignItems='center' >
        <Link to={'/wallet'}>
          <HStack space={1} alignItems='center'>
            <Icon src={walletIcon} size={20} className='text-gray-200' />
            <Text size='lg'>
              {intl.formatMessage(messages.wallet)}
            </Text>
          </HStack>
        </Link>

        <HStack alignItems='center' space={2}>
          {!expanded && <>
            { eyeClosed ? <Text className='text-sm !text-gray-500'>{intl.formatMessage({ id: 'wallet.hidden.balance', defaultMessage: '••••••' })}</Text> : <Text>
              {intl.formatMessage(messages.balance, { amount: walletData?.balance })}
            </Text>}

            <Button className='!ml-1 space-x-2 !border-none !p-0 !text-gray-500 focus:!ring-transparent focus:ring-offset-transparent rtl:ml-0 rtl:mr-1 rtl:space-x-reverse' theme='transparent' onClick={() => setEyeClosed(!eyeClosed)}>
              <Icon src={eyeClosed ? eyeClosedIcon : eyeIcon} className='text-gray-500 hover:cursor-pointer' size={18} />
            </Button>
          </>}

          <Button className='!ml-1 space-x-2 !border-none !p-0 !text-gray-500 focus:!ring-transparent focus:ring-offset-transparent rtl:ml-0 rtl:mr-1 rtl:space-x-reverse' theme='transparent' onClick={() => setExpanded(!expanded)}>
            <Icon src={!expanded ? arrowsDiagonalIcon : arrowsDiagonalMinimizeIcon} className='rounded-full bg-secondary-500 p-1 text-white hover:cursor-pointer' size={22} />
          </Button>

        </HStack>
      </HStack>

      {expanded && <Balance />}
    </Stack>
  );

};

export default PocketWallet;