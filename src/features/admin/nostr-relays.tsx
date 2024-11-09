import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { Button, Column, Form, FormActions, Stack } from 'soapbox/components/ui';
import RelayEditor, { RelayData } from 'soapbox/features/nostr-relays/components/relay-editor';
import { useApi } from 'soapbox/hooks';

import { useAdminNostrRelays } from './hooks/useAdminNostrRelays';

const messages = defineMessages({
  title: { id: 'column.admin.nostr_relays', defaultMessage: 'Relays' },
});

const AdminNostrRelays: React.FC = () => {
  const api = useApi();
  const intl = useIntl();
  const result = useAdminNostrRelays();

  const [relays, setRelays] = useState<RelayData[]>(result.data ?? []);

  const mutation = useMutation({
    mutationFn: async () => api.put('/api/v1/admin/ditto/relays', relays),
  });

  const handleSubmit = () => {
    mutation.mutate();
  };

  useEffect(() => {
    setRelays(result.data ?? []);
  }, [result.data]);

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Form onSubmit={handleSubmit}>
        <Stack space={4}>
          <RelayEditor relays={relays} setRelays={setRelays} />

          <FormActions>
            <Button to='/soapbox/admin' theme='tertiary'>
              <FormattedMessage id='common.cancel' defaultMessage='Cancel' />
            </Button>

            <Button theme='primary' type='submit' disabled={mutation.isPending}>
              <FormattedMessage id='edit_profile.save' defaultMessage='Save' />
            </Button>
          </FormActions>
        </Stack>
      </Form>
    </Column>
  );
};

export default AdminNostrRelays;