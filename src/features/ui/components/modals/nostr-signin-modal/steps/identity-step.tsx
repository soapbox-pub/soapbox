import React, { useState } from 'react';

import { accountLookup } from 'soapbox/actions/accounts';
import Button from 'soapbox/components/ui/button/button';
import Form from 'soapbox/components/ui/form/form';
import FormGroup from 'soapbox/components/ui/form-group/form-group';
import HStack from 'soapbox/components/ui/hstack/hstack';
import Input from 'soapbox/components/ui/input/input';
import Stack from 'soapbox/components/ui/stack/stack';
import { useAppDispatch } from 'soapbox/hooks';

import EmojiGraphic from '../components/emoji-graphic';
import NostrExtensionIndicator from '../components/nostr-extension-indicator';

interface IIdentityStep {
  username: string;
  setUsername(username: string): void;
  setStep(step: number): void;
}

const IdentityStep: React.FC<IIdentityStep> = ({ username, setUsername, setStep }) => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleChangeUsername: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setNotFound(false);
    setUsername(e.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);

    await dispatch(accountLookup(username))
      .then(() => {
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
    <Form>
      <Stack className='mt-3' space={3}>
        <NostrExtensionIndicator />

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
  );
};

export default IdentityStep;
