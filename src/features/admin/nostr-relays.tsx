import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Button from '@/components/ui/button.tsx';
import { Column } from '@/components/ui/column.tsx';
import FormActions from '@/components/ui/form-actions.tsx';
import Form from '@/components/ui/form.tsx';
import Stack from '@/components/ui/stack.tsx';
import RelayEditor, { RelayData } from '@/features/nostr-relays/components/relay-editor.tsx';
import { useApi } from '@/hooks/useApi.ts';
import { queryClient } from '@/queries/client.ts';
import toast from '@/toast.tsx';

import { useAdminNostrRelays } from './hooks/useAdminNostrRelays.ts';

const messages = defineMessages({
  title: { id: 'column.admin.nostr_relays', defaultMessage: 'Relays' },
  success: { id: 'generic.saved', defaultMessage: 'Saved' },
});

const AdminNostrRelays: React.FC = () => {
  const api = useApi();
  const intl = useIntl();
  const result = useAdminNostrRelays();

  const [relays, setRelays] = useState<RelayData[]>(result.data ?? []);

  const mutation = useMutation({
    mutationFn: async () => api.put('/api/v1/admin/ditto/relays', relays),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['NostrRelay'] });
      toast.success(messages.success);
    },
    onError: (data) => {
      toast.error(data.message); // `data.message` is a generic error message, not the `error` message returned from the backend
    },
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