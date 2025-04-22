import helpIcon from '@tabler/icons/outline/help-circle.svg';
import plusIcon from '@tabler/icons/outline/square-rounded-plus.svg';
import { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import FormActions from 'soapbox/components/ui/form-actions.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Tooltip from 'soapbox/components/ui/tooltip.tsx';
import { MintEditor } from 'soapbox/features/wallet/components/editable-lists.tsx';
import { useWallet } from 'soapbox/features/zap/hooks/useHooks.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';

const messages = defineMessages({
  title: { id: 'wallet.create_wallet.title', defaultMessage: 'You don\'t have a wallet' },
  question: { id: 'wallet.create_wallet.question', defaultMessage: 'Do you want create one?' },
  button: { id: 'wallet.button.create_wallet', defaultMessage: 'Create' },
  mints: { id: 'wallet.mints', defaultMessage: 'Mints' },
});

const CreateWallet = () => {
  const intl = useIntl();
  const { account } = useOwnAccount();
  const [formActive, setFormActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mints, setMints] = useState<string[]>([]);
  const { createWallet } = useWallet();

  const handleSubmit = async () => {
    setIsLoading(true);

    const walletInfo = {
      mints: mints,
      relays: [],
    };

    await createWallet(walletInfo);
    setIsLoading(false);
  };

  if (!account) {
    return null;
  }

  return (
    <Stack
      className='rounded-lg border border-gray-200 p-8
       dark:border-gray-700'
      space={4}
    >
      <Stack space={3} justifyContent='center' alignItems='center'>
        {!formActive ? (
          <>
            <div className='mb-2 flex size-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-800'>
              <Icon
                className='size-8 text-primary-500 dark:text-primary-400'
                src={plusIcon}
              />
            </div>
            <Text
              theme='default'
              size='2xl'
              weight='bold'
              align='center'
              className='mb-1 text-gray-900 dark:text-gray-100'
            >
              {intl.formatMessage(messages.title)}
            </Text>
            <HStack space={3} className='mt-2'>
              <Text
                theme='default'
                size='lg'
                align='center'
                className='text-gray-800 dark:text-gray-200'
              >
                {intl.formatMessage(messages.question)}
              </Text>
              <Button
                theme='primary'
                text={intl.formatMessage(messages.button)}
                onClick={() => setFormActive(!formActive)}
                className='px-6 font-medium'
              />
            </HStack>
          </>
        ) : (
          <Stack space={5} className='w-full'>
            <Form onSubmit={handleSubmit}>
              <Stack className='rounded-lg p-4'>
                <HStack alignItems='center' space={2}>
                  <Text
                    size='lg'
                    weight='medium'
                    className='text-gray-900 dark:text-gray-100'
                  >
                    {intl.formatMessage(messages.mints)}
                  </Text>
                  <Tooltip text={'Mint: A kind of digital bank that issues tokens backed by Bitcoin, like \'Bitcoin gift cards\' with built-in privacy.'}>
                    <div className='text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'>
                      <Icon src={helpIcon} />
                    </div>
                  </Tooltip>
                </HStack>
                <div>
                  <MintEditor items={mints} setItems={setMints} />
                </div>
              </Stack>

              <FormActions>
                <Button
                  to='/wallet'
                  onClick={() => setFormActive(false)}
                  theme='tertiary'
                  className='px-6 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                >
                  <FormattedMessage id='common.cancel' defaultMessage='Cancel' />
                </Button>

                <Button
                  theme={isLoading ? 'secondary' : 'primary'}
                  type='submit'
                  disabled={isLoading}
                  className='px-6 font-medium'
                >
                  <FormattedMessage id='common.save' defaultMessage='Save' />
                </Button>
              </FormActions>
            </Form>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default CreateWallet;