import React from 'react';
import { FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import { Button, Stack, Modal } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import EmojiGraphic from '../components/emoji-graphic';
import NostrExtensionIndicator from '../components/nostr-extension-indicator';
import { Step } from '../nostr-signin-modal';

interface IKeyStep {
  setStep(step: Step): void;
  onClose(): void;
}

const KeyStep: React.FC<IKeyStep> = ({ setStep, onClose }) => {
  const dispatch = useAppDispatch();

  const onAltClick = () => {
    dispatch(openModal('NOSTR_LOGIN'));
    onClose();
  };

  return (
    <Modal title={<FormattedMessage id='nostr_signin.key.title' defaultMessage='You need a key to continue' />} onClose={onClose}>
      <Stack className='my-3' space={6}>
        <NostrExtensionIndicator />

        <EmojiGraphic emoji='🔑' />

        <Stack space={3} alignItems='center'>
          <Button theme='accent' size='lg' onClick={() => setStep('keygen')}>
            Generate key
          </Button>

          <Button theme='transparent' onClick={onAltClick}>
            I already have a key
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default KeyStep;
