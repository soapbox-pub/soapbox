import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { accountLookup } from 'soapbox/actions/accounts';
import { Button, Form, FormGroup, HStack, Input, Stack, Modal } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import EmojiGraphic from '../components/emoji-graphic';
import NostrExtensionIndicator from '../components/nostr-extension-indicator';

interface IIdentityStep {
  setAccountId(accountId: string): void;
  setStep(step: number): void;
  onClose(): void;
}

const IdentityStep: React.FC<IIdentityStep> = ({ setAccountId, setStep, onClose }) => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [username, setUsername] = useState('');

  const handleChangeUsername: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setNotFound(false);
    setUsername(e.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);

    await dispatch(accountLookup(username))
      .then((account) => {
        setAccountId(account.id);
        setStep(3);
        setNotFound(false);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response?.status === 404) {
          setNotFound(true);
        }
        setLoading(false);
      });
  };

  const errors: string[] = [];
  if (notFound) {
    errors.push('Account not found');
  }

  return (
    <Modal title={<FormattedMessage id='nostr_signin.identity.title' defaultMessage='Who are you?' />} onClose={onClose}>
      <Form>
        <Stack className='mt-3' space={3}>
          <div className='my-3'>
            <NostrExtensionIndicator />
          </div>

          <EmojiGraphic emoji='🕵️' />

          <FormGroup labelText='Username' errors={errors}>
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
            <Button theme='transparent' onClick={() => setStep(2)} disabled={loading}>Sign up</Button>

            <Button
              theme='accent'
              type='submit' disabled={!username || loading || notFound}
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
