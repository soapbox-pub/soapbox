import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import { NostrSigner } from 'nspec';
import React, { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Button, Stack, Modal } from 'soapbox/components/ui';
import { NKeys } from 'soapbox/features/nostr/keys';
import { useInstance } from 'soapbox/hooks';
import { download } from 'soapbox/utils/download';
import { slugify } from 'soapbox/utils/input';

import EmojiGraphic from '../components/emoji-graphic';

interface IKeygenStep {
  setSigner(signer: NostrSigner): void;
  setStep(step: number): void;
  onClose(): void;
}

const KeygenStep: React.FC<IKeygenStep> = ({ setSigner, setStep, onClose }) => {
  const instance = useInstance();

  const secretKey = useMemo(() => generateSecretKey(), []);
  const pubkey = useMemo(() => getPublicKey(secretKey), [secretKey]);

  const nsec = useMemo(() => nip19.nsecEncode(secretKey), [secretKey]);
  const npub = useMemo(() => nip19.npubEncode(pubkey), [pubkey]);

  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    download(nsec, `${slugify(instance.title)}-${npub.slice(5, 9)}.nsec`);
    setDownloaded(true);
  };

  const handleNext = () => {
    const signer = NKeys.add(secretKey);
    setSigner(signer);
  };

  return (
    <Modal title={<FormattedMessage id='nostr_signin.keygen.title' defaultMessage='Your new key' />} onClose={onClose}>
      <Stack className='my-3' space={6}>
        <EmojiGraphic emoji='🔑' />

        <Stack alignItems='center'>
          <Button theme='primary' size='lg' icon={require('@tabler/icons/download.svg')} onClick={handleDownload}>
            Download key
          </Button>
        </Stack>

        <Stack space={3} alignItems='end'>
          <Button theme='accent' disabled={!downloaded} size='lg' onClick={handleNext}>
            Next
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default KeygenStep;
