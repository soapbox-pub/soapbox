import exclamationIcon from '@tabler/icons/outline/exclamation-circle.svg';
import plusIcon from '@tabler/icons/outline/square-rounded-plus.svg';
import { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import FormActions from 'soapbox/components/ui/form-actions.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { MintEditor } from 'soapbox/features/wallet/components/editable-lists.tsx';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { WalletData, baseWalletSchema } from 'soapbox/schemas/wallet.ts';
import toast from 'soapbox/toast.tsx';

const messages = defineMessages({
  title: { id: 'wallet.create_wallet.title', defaultMessage: 'You don\'t have a wallet' },
  question: { id: 'wallet.create_wallet.question', defaultMessage: 'Do you want create one?' },
  button: { id: 'wallet.create_wallet.button', defaultMessage: 'Create wallet' },
  mints: { id: 'wallet.mints', defaultMessage: 'Mints' },
});

const CreateWallet: React.FC<{ setWalletData: React.Dispatch<React.SetStateAction<WalletData | undefined>> }> = ({ setWalletData }) => {
  const api = useApi();
  const intl = useIntl();
  const { account } = useOwnAccount();
  const [formActive, setFormActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mints, setMints] = useState<string[]>([]);

  const handleSubmit = async () => {
    setIsLoading(true);

    const wallet = {
      mints: mints,
    };

    try {
      const response = await api.put('/api/v1/ditto/cashu/wallet', wallet);
      const data = await response.json();
      if (data) {
        // toast.success('Deu certo garai')
        const normalizedData = baseWalletSchema.parse(data);
        toast.success('Walllet Created with success'); // TO DO : create translated text
        setWalletData(normalizedData);
      }
    } catch (e) {
      toast.error('An error had occured'); // TO DO : create translated text
    }

    setIsLoading(false);
  };

  if (!account) {
    return null;
  }

  return (
    <Stack className='rounded-lg border p-6'  space={4}>
      <Stack space={3} justifyContent='center' alignItems='center'>
        {!formActive
          ?
          (
            <>
              <Text theme='default' size='2xl'>
                {intl.formatMessage(messages.title)}
              </Text>
              <HStack space={2}>
                <Text theme='default' size='lg'>
                  {intl.formatMessage(messages.question)}
                </Text>
                <Button icon={plusIcon} theme='primary' text={intl.formatMessage(messages.button)} onClick={() => setFormActive(!formActive)} />
              </HStack>
            </>
          )
          :
          (
            <Stack space={4} className='w-full'>
              <Form onSubmit={handleSubmit}>
                <Stack>
                  <HStack alignItems='center' space={1}>
                    <Text>
                      {intl.formatMessage(messages.mints)}
                    </Text>
                    <SvgIcon src={exclamationIcon} />
                  </HStack>
                  <MintEditor items={mints} setItems={setMints} />
                </Stack>

                <FormActions>
                  <Button to='/wallet' onClick={()=> setFormActive(false)} theme='tertiary'>
                    <FormattedMessage id='common.cancel' defaultMessage='Cancel' />
                  </Button>

                  <Button theme={isLoading ? 'secondary' : 'primary'} type='submit' disabled={isLoading}>
                    <FormattedMessage id='common.save' defaultMessage='Save' />
                  </Button>
                </FormActions>
              </Form>
            </Stack>
          )
        }
      </Stack>
    </Stack>
  );
};

export default CreateWallet;