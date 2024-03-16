import { getPublicKey, nip19 } from 'nostr-tools';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Button, Stack, Modal, Input, FormGroup, Form } from 'soapbox/components/ui';
import { NKeys } from 'soapbox/features/nostr/keys';

import EmojiGraphic from '../components/emoji-graphic';
import NostrExtensionIndicator from '../components/nostr-extension-indicator';
import { Step } from '../nostr-signin-modal';

interface IKeyAddStep {
  setAccountId(accountId: string): void;
  setStep(step: Step): void;
  onClose(): void;
}

const KeyAddStep: React.FC<IKeyAddStep> = ({ setAccountId, setStep, onClose }) => {
  const [nsec, setNsec] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNsec(e.target.value);
    setError(undefined);
  };

  const handleSubmit = () => {
    try {
      const result = nip19.decode(nsec);
      if (result.type === 'nsec') {
        const seckey = result.data;
        const pubkey = getPublicKey(seckey);
        NKeys.add(seckey);
        setAccountId(pubkey);
        setStep('account');
      }
    } catch (e) {
      setError('Invalid nsec');
    }
  };

  return (
    <Modal title={<FormattedMessage id='nostr_signin.key-add.title' defaultMessage='Import Key' />} onClose={onClose}>
      <Stack className='my-3' space={6}>
        <NostrExtensionIndicator />

        <EmojiGraphic emoji='🔑' />

        <Form onSubmit={handleSubmit}>
          <Stack space={6}>
            <FormGroup labelText='Secret key' errors={error ? [error] : []}>
              <Input
                value={nsec}
                type='password'
                onChange={handleChange}
                placeholder='nsec1…'
              />
            </FormGroup>

            <Button theme='accent' size='lg' type='submit'>
              Add Key
            </Button>
          </Stack>
        </Form>
      </Stack>
    </Modal>
  );
};

export default KeyAddStep;
