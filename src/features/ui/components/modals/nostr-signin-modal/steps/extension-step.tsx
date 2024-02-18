import React from 'react';
import { FormattedMessage } from 'react-intl';

import { nostrExtensionLogIn } from 'soapbox/actions/nostr';
import { Button, Stack, Modal } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import EmojiGraphic from '../components/emoji-graphic';

interface IExtensionStep {
  setStep: (step: number) => void;
  onClose(): void;
}

const ExtensionStep: React.FC<IExtensionStep> = ({ setStep, onClose }) => {
  const dispatch = useAppDispatch();

  const onClick = () => dispatch(nostrExtensionLogIn());
  const onClickAlt = () => setStep(1);

  return (
    <Modal title={<FormattedMessage id='nostr_signin.siwe.title' defaultMessage='Sign in' />} onClose={onClose}>
      <Stack className='my-6' space={3}>
        <EmojiGraphic emoji='🔐' />

        <Button theme='accent' size='lg' onClick={onClick}>
          <FormattedMessage id='nostr_signin.siwe.action' defaultMessage='Sign in with extension' />
        </Button>

        <Button theme='transparent' onClick={onClickAlt}>
          <FormattedMessage id='nostr_signin.siwe.alt' defaultMessage='Sign in with key' />
        </Button>
      </Stack>
    </Modal>
  );
};

export default ExtensionStep;
