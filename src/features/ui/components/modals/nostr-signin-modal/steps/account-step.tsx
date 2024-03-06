import { NSchema as n } from '@soapbox/nspec';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { useAccount } from 'soapbox/api/hooks';
import { Avatar, Text, Stack, Emoji, Button, Tooltip, Modal } from 'soapbox/components/ui';
import ModalLoading from 'soapbox/features/ui/components/modal-loading';
import { useInstance } from 'soapbox/hooks';

import { Step } from '../nostr-signin-modal';

interface IAccountStep {
  accountId: string;
  setStep(step: Step): void;
  onClose(): void;
}

const AccountStep: React.FC<IAccountStep> = ({ accountId, setStep, onClose }) => {
  const { account } = useAccount(accountId);
  const instance = useInstance();

  const isBech32 = useMemo(
    () => n.bech32().safeParse(account?.acct).success,
    [account?.acct],
  );

  if (!account) {
    return <ModalLoading />;
  }

  return (
    <Modal
      title={<FormattedMessage id='nostr_signin.account.title' defaultMessage='Your account' />}
      onClose={onClose}
      onBack={() => setStep('identity')}
    >
      <Stack space={6}>
        <Stack space={3} alignItems='center'>
          <Avatar className='bg-gray-100 dark:bg-gray-800' src={account.avatar} size={160} />

          <Stack space={1}>
            <Text
              size='xl'
              weight='semibold'
              align='center'
              dangerouslySetInnerHTML={{ __html: account.display_name_html }}
              truncate
            />

            <Tooltip text={account.nostr.npub ?? account.acct}>
              <Text size='sm' theme='muted' align='center' truncate>
                {isBech32 ? account.acct.slice(0, 13) : account.acct}
              </Text>
            </Tooltip>
          </Stack>
        </Stack>

        {account.ditto.is_registered ? (
          <Button theme='accent' size='lg' block>Continue</Button>
        ) : (
          <Stack space={6}>
            <Stack space={3} alignItems='center' className='rounded-xl bg-gray-100 p-4 dark:bg-gray-800'>
              <Emoji className='h-16 w-16' emoji='🫂' />

              <Text align='center' className='max-w-72'>
                You need an account on {instance.title} to continue.
              </Text>
            </Stack>

            <Button theme='accent' size='lg' block>Join</Button>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};

export default AccountStep;
