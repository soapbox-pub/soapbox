import React from 'react';
import { FormattedMessage } from 'react-intl';

import { nostrExtensionLogIn } from 'soapbox/actions/nostr';
import EmojiGraphic from 'soapbox/components/emoji-graphic';
import { Button, Stack, Modal } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import { Step } from '../nostr-login-modal';

interface IExtensionStep {
  setStep: (step: Step) => void;
  onClose(): void;
}

const ExtensionStep: React.FC<IExtensionStep> = ({ setStep, onClose }) => {
  const dispatch = useAppDispatch();

  const onClick = () => {
    dispatch(nostrExtensionLogIn());
    onClose();
  };

  const onClickAlt = () => setStep('key-add');

  return (
    <Modal title={<FormattedMessage id='nostr_signup.siwe.title' defaultMessage='Sign in' />} onClose={onClose}>
      <Stack space={6}>
        <EmojiGraphic emoji='🔐' />

        <Stack space={3}>
          <Button theme='accent' size='lg' onClick={onClick}>
            <FormattedMessage id='nostr_signup.siwe.action' defaultMessage='Sign in with extension' />
          </Button>

          <Button theme='transparent' onClick={onClickAlt}>
            <FormattedMessage id='nostr_signup.siwe.alt' defaultMessage='Sign in with key' />
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default ExtensionStep;
