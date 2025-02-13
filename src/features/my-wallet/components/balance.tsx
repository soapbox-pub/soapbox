// import IconButton from 'soapbox/components/ui/icon-button.tsx';
import withddrawIcon from '@tabler/icons/outline/cash.svg';
import editIcon from '@tabler/icons/outline/edit.svg';
import exchangeIcon from '@tabler/icons/outline/transfer.svg';
import { FormattedMessage } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import Divider from 'soapbox/components/ui/divider.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';


// const messages = defineMessages({
//   label: { id: 'settings.messages.label', defaultMessage: 'Allow users to start a new chat with you' },
// });

const Balance = () => {
  const { account } = useOwnAccount();

  if (!account) {
    return null;
  }

  return (
    <Stack className='rounded-lg border p-6' alignItems='center' space={4}>

      <Stack space={3}>
        <HStack space={2} className='relative'>
          <Text theme='default' size='lg'>
            <FormattedMessage id='my_wallet' defaultMessage='The Wallet of Doom 💀' />
          </Text>
          <SvgIcon className='absolute -right-8 text-primary-500' src={editIcon} />
        </HStack>
        <Text theme='default' size='3xl'>
          {/* 166,186 sats */}
        </Text>
      </Stack>

      <div className='w-full'>
        <Divider />
      </div>


      <HStack space={2}>
        <Button icon={withddrawIcon} theme='primary' text={'Withdraw'} />
        <Button icon={exchangeIcon} theme='secondary' text={'Exchange'} />
      </HStack>
    </Stack>
  );
};

export default Balance;