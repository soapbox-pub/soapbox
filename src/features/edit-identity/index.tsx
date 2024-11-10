import atIcon from '@tabler/icons/outline/at.svg';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { patchMe } from 'soapbox/actions/me.ts';
import { changeSetting } from 'soapbox/actions/settings.ts';
import List, { ListItem } from 'soapbox/components/list.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import { CardHeader, CardTitle } from 'soapbox/components/ui/card.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Emoji from 'soapbox/components/ui/emoji.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Textarea from 'soapbox/components/ui/textarea.tsx';
import Tooltip from 'soapbox/components/ui/tooltip.tsx';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { useSettings } from 'soapbox/hooks/useSettings.ts';
import { queryClient } from 'soapbox/queries/client.ts';
import { adminAccountSchema } from 'soapbox/schemas/admin-account.ts';
import toast from 'soapbox/toast.tsx';

interface IEditIdentity {
}

const messages = defineMessages({
  title: { id: 'settings.edit_identity', defaultMessage: 'Identity' },
  username: { id: 'edit_profile.fields.nip05_label', defaultMessage: 'Username' },
  unverified: { id: 'edit_profile.fields.nip05_unverified', defaultMessage: 'Name could not be verified and won\'t be used.' },
  success: { id: 'edit_profile.success', defaultMessage: 'Your profile has been successfully saved!' },
  error: { id: 'edit_profile.error', defaultMessage: 'Profile update failed' },
  placeholder: { id: 'edit_identity.reason_placeholder', defaultMessage: 'Why do you want to be part of the {siteTitle} community?' },
  requested: { id: 'edit_identity.requested', defaultMessage: 'Name requested' },
});

/** EditIdentity component. */
const EditIdentity: React.FC<IEditIdentity> = () => {
  const intl = useIntl();
  const { instance } = useInstance();
  const dispatch = useAppDispatch();
  const { account } = useOwnAccount();
  const { mutate, isPending } = useRequestName();

  const { data: approvedNames } = useNames();
  const { data: pendingNames } = usePendingNames();
  const { dismissedSettingsNotifications } = useSettings();

  const [username, setUsername] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    const dismissed = new Set(dismissedSettingsNotifications);

    if (!dismissed.has('needsNip05')) {
      dismissed.add('needsNip05');
      dispatch(changeSetting(['dismissedSettingsNotifications'], [...dismissed]));
    }
  }, []);

  if (!account) return null;

  const updateName = async (name: string): Promise<void> => {
    if (account.source?.nostr?.nip05 === name) return;
    try {
      await dispatch(patchMe({ nip05: name }));
      toast.success(intl.formatMessage(messages.success));
    } catch (e) {
      toast.error(intl.formatMessage(messages.error));
    }
  };

  const submit = () => {
    const name = `${username}@${instance.domain}`;

    mutate({ name, reason }, {
      onSuccess() {
        toast.success(intl.formatMessage(messages.requested));
        queryClient.invalidateQueries({
          queryKey: ['names', 'pending'],
        });
        setUsername('');
        setReason('');
      },
    });
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <div className='space-y-4'>
        <Form>
          <UsernameInput value={username} onChange={(e) => setUsername(e.target.value)} disabled={isPending} />
          <Textarea
            name='reason'
            placeholder={intl.formatMessage(messages.placeholder, { siteTitle: instance.title })}
            maxLength={500}
            onChange={(e) => setReason(e.target.value)}
            disabled={isPending}
            value={reason}
            autoGrow
            required
          />
          <Button theme='accent' onClick={submit} disabled={isPending}>
            <FormattedMessage id='edit_identity.request' defaultMessage='Request' />
          </Button>
        </Form>

        {((approvedNames?.length ?? 0) > 0) && (
          <>
            <CardHeader>
              <CardTitle title={<FormattedMessage id='edit_identity.names_title' defaultMessage='Names' />} />
            </CardHeader>

            <List>
              {approvedNames?.map(({ username, domain }) => {
                const identifier = `${username}@${domain}`;
                if (!identifier) return null;

                return (
                  <ListItem
                    key={identifier}
                    label={
                      <HStack alignItems='center' space={2}>
                        <span>{identifier}</span>
                        {(account.source?.nostr?.nip05 === identifier && account.acct !== identifier) && (
                          <Tooltip text={intl.formatMessage(messages.unverified)}>
                            <div>
                              <Emoji className='size-4' emoji='⚠️' />
                            </div>
                          </Tooltip>
                        )}
                      </HStack>
                    }
                    isSelected={account.source?.nostr?.nip05 === identifier}
                    onSelect={() => updateName(identifier)}
                  />
                );
              })}
            </List>
          </>
        )}

        {((pendingNames?.length ?? 0) > 0) && (
          <>
            <CardHeader>
              <CardTitle title={<FormattedMessage id='edit_identity.pending_names_title' defaultMessage='Requested Names' />} />
            </CardHeader>

            <List>
              {pendingNames?.map(({ username, domain }) => {
                const identifier = `${username}@${domain}`;
                if (!identifier) return null;

                return (
                  <ListItem
                    key={identifier}
                    label={
                      <HStack alignItems='center' space={2}>
                        <span>{identifier}</span>
                      </HStack>
                    }
                  />
                );
              })}
            </List>
          </>
        )}
      </div>
    </Column>
  );
};

const UsernameInput: React.FC<React.ComponentProps<typeof Input>> = (props) => {
  const intl = useIntl();
  const { instance } = useInstance();

  return (
    <Input
      placeholder={intl.formatMessage(messages.username)}
      append={(
        <HStack alignItems='center' space={1} className='rounded p-1 text-sm backdrop-blur'>
          <Icon className='size-4' src={atIcon} />
          <span>{instance.domain}</span>
        </HStack>
      )}
      {...props}
    />
  );
};

interface NameRequestData {
  name: string;
  reason?: string;
}

function useRequestName() {
  const api = useApi();

  return useMutation({
    mutationFn: (data: NameRequestData) => api.post('/api/v1/ditto/names', data),
  });
}

function useNames() {
  const api = useApi();

  return useQuery({
    queryKey: ['names', 'approved'],
    queryFn: async () => {
      const response = await api.get('/api/v1/ditto/names?approved=true');
      const data = await response.json();
      return adminAccountSchema.array().parse(data);
    },
    placeholderData: [],
  });
}

function usePendingNames() {
  const api = useApi();

  return useQuery({
    queryKey: ['names', 'pending'],
    queryFn: async () => {
      const response = await api.get('/api/v1/ditto/names?approved=false');
      const data = await response.json();
      return adminAccountSchema.array().parse(data);
    },
    placeholderData: [],
  });
}

export default EditIdentity;