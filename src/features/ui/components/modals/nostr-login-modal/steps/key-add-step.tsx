import { nip19 } from 'nostr-tools';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';


import { logInNostr } from 'soapbox/actions/nostr.ts';
import EmojiGraphic from 'soapbox/components/emoji-graphic.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import Divider from 'soapbox/components/ui/divider.tsx';
import FormGroup from 'soapbox/components/ui/form-group.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { useNostr } from 'soapbox/contexts/nostr-context.tsx';
import { keyring } from 'soapbox/features/nostr/keyring.ts';
import { useAppDispatch } from 'soapbox/hooks/index.ts';

import NostrExtensionIndicator from '../components/nostr-extension-indicator.tsx';

interface IKeyAddStep {
  onClose(): void;
}

const KeyAddStep: React.FC<IKeyAddStep> = ({ onClose }) => {
  const [nsec, setNsec] = useState('');
  const [error, setError] = useState<string | undefined>();

  const dispatch = useAppDispatch();
  const { relay } = useNostr();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNsec(e.target.value);
    setError(undefined);
  };

  const handleSubmit = async () => {
    if (!relay) return;
    try {
      const result = nip19.decode(nsec);
      if (result.type === 'nsec') {
        const seckey = result.data;
        const signer = keyring.add(seckey);
        dispatch(logInNostr(signer, relay));
        onClose();
        return;
      }
      setError('Invalid nsec');
    } catch (e) {
      setError('Invalid nsec');
    }
  };

  return (
    <Modal title={<FormattedMessage id='nostr_signup.key-add.title' defaultMessage='Import Key' />} width='sm' onClose={onClose}>
      <Stack className='my-3' space={6}>

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

            <Stack space={2}>
              <Button theme='accent' size='lg' type='submit' disabled={!nsec}>
                <FormattedMessage id='nostr_signup.key-add.key_button' defaultMessage='Add Key' />
              </Button>

              <Divider text='or' />

              <NostrExtensionIndicator />
            </Stack>

          </Stack>
        </Form>


      </Stack>
    </Modal>
  );
};

export default KeyAddStep;
