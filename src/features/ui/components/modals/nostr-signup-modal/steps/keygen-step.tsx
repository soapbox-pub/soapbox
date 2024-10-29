import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchAccount } from 'soapbox/actions/accounts';
import { logInNostr } from 'soapbox/actions/nostr';
import { closeSidebar } from 'soapbox/actions/sidebar';
import EmojiGraphic from 'soapbox/components/emoji-graphic';
import { Button, Stack, Modal, FormGroup, Text, Tooltip, HStack, Input } from 'soapbox/components/ui';
import { useNostr } from 'soapbox/contexts/nostr-context';
import { NKeys } from 'soapbox/features/nostr/keys';
import { useAppDispatch, useInstance } from 'soapbox/hooks';
import { useIsMobile } from 'soapbox/hooks/useIsMobile';
import { download } from 'soapbox/utils/download';
import { slugify } from 'soapbox/utils/input';

interface IKeygenStep {
  onClose(): void;
}

const KeygenStep: React.FC<IKeygenStep> = ({ onClose }) => {
  const { instance } = useInstance();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { relay } = useNostr();

  const secretKey = useMemo(() => generateSecretKey(), []);
  const pubkey = useMemo(() => getPublicKey(secretKey), [secretKey]);

  const nsec = useMemo(() => nip19.nsecEncode(secretKey), [secretKey]);
  const npub = useMemo(() => nip19.npubEncode(pubkey), [pubkey]);

  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    // Pre-fetch into cache.
    dispatch(fetchAccount(pubkey)).catch(() => {});
  }, [pubkey]);

  const handleDownload = () => {
    download(nsec, `${slugify(instance.title)}-${npub.slice(5, 9)}.nsec.txt`);
    setDownloaded(true);
  };

  const handleNext = async () => {
    if (!relay) return;

    const signer = NKeys.add(secretKey);
    const now = Math.floor(Date.now() / 1000);

    const [kind0, ...events] = await Promise.all([
      signer.signEvent({ kind: 0, content: JSON.stringify({}), tags: [], created_at: now }),
      signer.signEvent({ kind: 3, content: '', tags: [], created_at: now }),
      signer.signEvent({ kind: 10000, content: '', tags: [], created_at: now }),
      signer.signEvent({ kind: 10001, content: '', tags: [], created_at: now }),
      signer.signEvent({ kind: 10002, content: '', tags: [], created_at: now }),
      signer.signEvent({ kind: 10003, content: '', tags: [], created_at: now }),
      signer.signEvent({ kind: 30078, content: '', tags: [['d', 'pub.ditto.pleroma_settings_store']], created_at: now }),
    ]);

    await relay.event(kind0);
    await Promise.all(events.map((event) => relay.event(event)));

    onClose();

    await dispatch(logInNostr(signer, relay, AbortSignal.timeout(30_000)));

    if (isMobile) {
      dispatch(closeSidebar());
    }

  };

  return (
    <Modal title={<FormattedMessage id='nostr_signup.keygen.title' defaultMessage='Your new key' />} width='sm' onClose={onClose}>
      <Stack className='my-3' space={9}>
        <EmojiGraphic emoji='🔑' />

        <FormGroup labelText={<FormattedMessage id='nostr_signup.keygen.label_text' defaultMessage='Secret Key' />}>
          <Input
            type={'password'}
            value={nsec}
            className='rounded-lg'
            outerClassName='grow'
            readOnly
          />
        </FormGroup>

        <Stack className='rounded-xl bg-gray-100 p-4 dark:bg-gray-800'>
          <Text size='xs' className='text-justify' >
            <FormattedMessage id='nostr_signup.keygen.text' defaultMessage='Back up your secret key in a secure place. If lost, your account cannot be recovered. Never share your secret key with anyone.' />
          </Text>
        </Stack>

        <HStack space={6} justifyContent='center' >
          <Button theme='secondary' size='lg' icon={require('@tabler/icons/outline/download.svg')} onClick={handleDownload}>
            <FormattedMessage id='nostr_signup.keygen.download_key_button' defaultMessage='Download key' />
          </Button>

          <Tooltip text='Download your key to continue' disabled={downloaded}>
            <Button theme='accent' disabled={!downloaded} size='lg' onClick={handleNext}>
              <FormattedMessage id='nostr_signup.keygen.next' defaultMessage='Next' />
            </Button>
          </Tooltip>
        </HStack>

      </Stack>
    </Modal>
  );
};

export default KeygenStep;
