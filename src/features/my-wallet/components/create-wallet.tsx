import plusIcon from '@tabler/icons/outline/square-rounded-plus.svg';
import { FormattedMessage } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';

const CreateWallet = () => {
  const { account } = useOwnAccount();

  if (!account) {
    return null;
  }

  return (
    <Stack className='rounded-lg border p-6' alignItems='center' space={4}>
      <Stack space={3} justifyContent='center' alignItems='center'>
        <Text theme='default' size='2xl'>
          <FormattedMessage id='my_wallet' defaultMessage={'You don\'t have a wallet'} />
        </Text>
        <HStack space={2}>
          <Text theme='default' size='lg'>
            {/* Do you want create one? */}
          </Text>
          <Button icon={plusIcon} theme='primary' text={'Create wallet'} />
        </HStack>
      </Stack>
    </Stack>
  );
};

export default CreateWallet;