import React from 'react';

import Button from 'soapbox/components/ui/button/button';
import Stack from 'soapbox/components/ui/stack/stack';

import EmojiGraphic from '../components/emoji-graphic';
import NostrExtensionIndicator from '../nostr-extension-indicator';

interface IKeyStep {
  setStep(step: number): void;
}

const KeyStep: React.FC<IKeyStep> = ({ setStep }) => {
  return (
    <Stack className='my-3' space={6} justifyContent='center'>
      <NostrExtensionIndicator />

      <EmojiGraphic emoji='🔑' />

      <Stack space={3} alignItems='center'>
        <Button theme='accent' size='lg'>
          Generate key
        </Button>

        <Button theme='transparent' onClick={() => setStep(1)}>
          I already have a key
        </Button>
      </Stack>
    </Stack>
  );
};

export default KeyStep;
