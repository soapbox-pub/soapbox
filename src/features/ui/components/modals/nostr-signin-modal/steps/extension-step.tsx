import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from 'soapbox/components/ui/button/button';
import Stack from 'soapbox/components/ui/stack/stack';
import { signer } from 'soapbox/features/nostr/sign';

interface IExtensionStep {
  setStep: (step: number) => void;
}

const ExtensionStep: React.FC<IExtensionStep> = ({ setStep }) => {
  const onClick = () => {
    signer!.getPublicKey();
  };

  const onClickAlt = () => {
    setStep(1);
  };

  return (
    <Stack className='my-6' space={3}>
      <Button theme='accent' size='lg' onClick={onClick}>
        <FormattedMessage id='nostr_signin.siwe.action' defaultMessage='Sign in with extension' />
      </Button>

      <Button theme='transparent' onClick={onClickAlt}>
        <FormattedMessage id='nostr_signin.siwe.alt' defaultMessage='Sign in with key' />
      </Button>
    </Stack>
  );
};

export default ExtensionStep;
