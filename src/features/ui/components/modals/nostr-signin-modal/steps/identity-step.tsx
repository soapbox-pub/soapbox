import React from 'react';

import Button from 'soapbox/components/ui/button/button';
import FormGroup from 'soapbox/components/ui/form-group/form-group';
import HStack from 'soapbox/components/ui/hstack/hstack';
import Input from 'soapbox/components/ui/input/input';
import Stack from 'soapbox/components/ui/stack/stack';

import NostrExtensionIndicator from '../nostr-extension-indicator';

interface IIdentityStep {
  username: string;
  setUsername(username: string): void;
  setStep(step: number): void;
}

const IdentityStep: React.FC<IIdentityStep> = ({ username, setUsername, setStep }) => {
  return (
    <Stack className='mt-3' space={3}>
      <NostrExtensionIndicator />

      <FormGroup labelText='Username'>
        <Input
          icon={require('@tabler/icons/at.svg')}
          placeholder='Username or npub'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </FormGroup>

      <HStack space={2} alignItems='center' justifyContent='between'>
        <Button theme='transparent'>Sign up</Button>
        <Button theme='accent' disabled={!username} onClick={() => setStep(3)}>Next</Button>
      </HStack>
    </Stack>
  );
};

export default IdentityStep;
