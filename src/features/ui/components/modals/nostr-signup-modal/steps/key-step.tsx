import { FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals.ts';
import EmojiGraphic from 'soapbox/components/emoji-graphic.tsx';
import { Button, Stack, Modal, Text, Divider } from 'soapbox/components/ui/index.ts';
import { useAppDispatch } from 'soapbox/hooks/index.ts';

import NostrExtensionIndicator from '../../nostr-login-modal/components/nostr-extension-indicator.tsx';

interface IKeyStep {
  setStep(step: 'extension' | 'key' | 'keygen'): void;
  onClose(): void;
}

const KeyStep: React.FC<IKeyStep> = ({ setStep, onClose }) => {
  const dispatch = useAppDispatch();

  const onAltClick = () => {
    onClose();
    dispatch(openModal('NOSTR_LOGIN', { step: 'key-add' }));
  };

  return (
    <Modal title={<FormattedMessage id='nostr_signup.siwe.title' defaultMessage='Sign up' />} width='sm' onClose={onClose}>
      <Stack className='my-3' alignItems='center' space={6}>

        <Text weight='semibold'>
          <FormattedMessage id='nostr_signup.key.title' defaultMessage='You need a key to continue' />
        </Text>

        <EmojiGraphic emoji='🔑' />

        <Stack space={3} alignItems='center'>
          <Button theme='accent' size='lg' onClick={() => setStep('keygen')}>
            <FormattedMessage id='nostr_signup.key_generate' defaultMessage='Generate key' />
          </Button>

          <Button theme='transparent' onClick={onAltClick}>
            <FormattedMessage id='nostr_signup.has_key' defaultMessage='I already have a key' />
          </Button>
        </Stack>


      </Stack>

      <Stack space={4}>
        <Divider text='or' />
        <NostrExtensionIndicator />
      </Stack>
    </Modal>
  );
};

export default KeyStep;
