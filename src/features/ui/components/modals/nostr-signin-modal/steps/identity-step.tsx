import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { accountLookup } from 'soapbox/actions/accounts';
import { Button, Form, FormGroup, HStack, Input, Stack, Modal } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import EmojiGraphic from '../components/emoji-graphic';
import NostrExtensionIndicator from '../components/nostr-extension-indicator';
import { Step } from '../nostr-signin-modal';

interface IIdentityStep {
  setAccountId(accountId: string): void;
  setStep(step: Step): void;
  onClose(): void;
}

const messages = defineMessages({
  notFound: { id: 'nostr_signin.identity.not_found', defaultMessage: 'Account not found' },
  nsec: { id: 'nostr_signin.identity.nsec', defaultMessage: 'Enter your public key' },
});

const IdentityStep: React.FC<IIdentityStep> = ({ setAccountId, setStep, onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');

  const handleChangeUsername: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setError(undefined);
    setUsername(e.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (username.startsWith('nsec1')) {
      setError(intl.formatMessage(messages.nsec));
      setLoading(false);
      return;
    }

    try {
      const account = await dispatch(accountLookup(username));
      setAccountId(account.id);
      setStep('account');
    } catch (e: any) {
      if (e.response?.status === 404) {
        setError(intl.formatMessage(messages.notFound));
      }
      setLoading(false);
    }
  };

  return (
    <Modal title={<FormattedMessage id='nostr_signin.identity.title' defaultMessage='Who are you?' />} onClose={onClose}>
      <Form>
        <Stack className='mt-3' space={3}>
          <div className='my-3'>
            <NostrExtensionIndicator />
          </div>

          <EmojiGraphic emoji='🕵️' />

          <FormGroup labelText='Username' errors={error ? [error] : []}>
            <Input
              icon={require('@tabler/icons/at.svg')}
              placeholder='Username or npub'
              value={username}
              onChange={handleChangeUsername}
              disabled={loading}
              autoFocus
            />
          </FormGroup>

          <HStack space={2} alignItems='center' justifyContent='between'>
            <Button theme='transparent' onClick={() => setStep('key')} disabled={loading}>Sign up</Button>

            <Button
              theme='accent'
              type='submit' disabled={!username || loading || !!error}
              onClick={handleSubmit}
            >
              Next
            </Button>
          </HStack>
        </Stack>
      </Form>
    </Modal>
  );
};

export default IdentityStep;
