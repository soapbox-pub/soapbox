import { useEffect, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import FormActions from 'soapbox/components/ui/form-actions.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { useNostr } from 'soapbox/contexts/nostr-context.tsx';
import { useNostrReq } from 'soapbox/features/nostr/hooks/useNostrReq.ts';
import { useSigner } from 'soapbox/hooks/nostr/useSigner.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';

import RelayEditor, { RelayData } from './components/relay-editor.tsx';

const messages = defineMessages({
  title: { id: 'nostr_relays.title', defaultMessage: 'Relays' },
});

const NostrRelays = () => {
  const intl = useIntl();
  const { account } = useOwnAccount();
  const { relay } = useNostr();
  const { signer } = useSigner();

  const { events } = useNostrReq(
    account?.nostr?.pubkey
      ? [{ kinds: [10002], authors: [account.nostr.pubkey], limit: 1 }]
      : [],
  );

  const [relays, setRelays] = useState<RelayData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const tags = events[0]?.tags ?? [];
    const data = tags.map(tag => ({ url: tag[1], marker: tag[2] as 'read' | 'write' | undefined }));
    setRelays(data);
  }, [events[0]]);

  const handleSubmit = async (): Promise<void> => {
    if (!signer || !relay) return;

    setIsLoading(true);

    const event = await signer.signEvent({
      kind: 10002,
      tags: relays.map(relay => relay.marker ? ['r', relay.url, relay.marker] : ['r', relay.url]),
      content: '',
      created_at: Math.floor(Date.now() / 1000),
    });

    // eslint-disable-next-line compat/compat
    await relay.event(event, { signal: AbortSignal.timeout(1000) });

    setIsLoading(false);
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Form onSubmit={handleSubmit}>
        <Stack space={4}>
          <RelayEditor relays={relays} setRelays={setRelays} />

          <FormActions>
            <Button to='/settings' theme='tertiary'>
              <FormattedMessage id='common.cancel' defaultMessage='Cancel' />
            </Button>

            <Button theme='primary' type='submit' disabled={isLoading}>
              <FormattedMessage id='edit_profile.save' defaultMessage='Save' />
            </Button>
          </FormActions>
        </Stack>
      </Form>
    </Column>
  );
};

export default NostrRelays;
