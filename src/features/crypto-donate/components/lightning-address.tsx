import { FormattedMessage } from 'react-intl';

import CopyableInput from 'soapbox/components/copyable-input.tsx';
import { Text, Stack, HStack, Emoji } from 'soapbox/components/ui/index.ts';

export interface ILightningAddress {
  address: string;
}

const LightningAddress: React.FC<ILightningAddress> = (props): JSX.Element => {
  const { address } = props;

  return (
    <Stack>
      <HStack alignItems='center' className='mb-1'>
        <Emoji
          className='mr-2.5 flex w-6 items-start justify-center rtl:ml-2.5 rtl:mr-0'
          emoji='⚡'
        />

        <Text weight='bold'>
          <FormattedMessage id='crypto.lightning' defaultMessage='Lightning' />
        </Text>
      </HStack>

      <CopyableInput value={address} />
    </Stack>
  );
};

export default LightningAddress;
