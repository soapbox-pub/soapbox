import React from 'react';

import Button from 'soapbox/components/ui/button/button';
import FormGroup from 'soapbox/components/ui/form-group/form-group';
import HStack from 'soapbox/components/ui/hstack/hstack';
import Input from 'soapbox/components/ui/input/input';
import Stack from 'soapbox/components/ui/stack/stack';

import NostrExtensionIndicator from '../nostr-extension-indicator';

interface IIdentityStep {
  setStep: (step: number) => void;
}

const IdentityStep: React.FC<IIdentityStep> = ({ setStep }) => {
  return (
    <Stack space={3}>
      <NostrExtensionIndicator signinAction={() => setStep(0)} />

      <FormGroup labelText='Username'>
        <Input
          icon={require('@tabler/icons/at.svg')}
          placeholder='Username or npub'
        />
      </FormGroup>

      <HStack space={2} alignItems='center' justifyContent='between'>
        <Button theme='transparent'>Sign up</Button>
        <Button theme='accent' onClick={() => setStep(2)}>Next</Button>
      </HStack>
    </Stack>
  );
};

export default IdentityStep;
