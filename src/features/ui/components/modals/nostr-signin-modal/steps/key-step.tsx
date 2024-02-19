import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Button, Stack, Modal } from 'soapbox/components/ui';

import EmojiGraphic from '../components/emoji-graphic';
import NostrExtensionIndicator from '../components/nostr-extension-indicator';

interface IKeyStep {
  setStep(step: number): void;
  onClose(): void;
}

const KeyStep: React.FC<IKeyStep> = ({ setStep, onClose }) => {
  return (
    <Modal title={<FormattedMessage id='nostr_signin.key.title' defaultMessage='You need a key to continue' />} onClose={onClose}>
      <Stack className='my-3' space={6}>
        <NostrExtensionIndicator />

        <EmojiGraphic emoji='🔑' />

        <Stack space={3} alignItems='center'>
          <Button theme='accent' size='lg' onClick={() => setStep(5)}>
            Generate key
          </Button>

          <Button theme='transparent' onClick={() => setStep(1)}>
            I already have a key
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default KeyStep;
