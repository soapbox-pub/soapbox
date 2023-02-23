import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { approveUsers } from 'soapbox/actions/admin';
import { rejectUserModal } from 'soapbox/actions/moderation';
import { Stack, HStack, Text, IconButton } from 'soapbox/components/ui';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';
import toast from 'soapbox/toast';

const messages = defineMessages({
  approved: { id: 'admin.awaiting_approval.approved_message', defaultMessage: '{acct} was approved!' },
  rejected: { id: 'admin.awaiting_approval.rejected_message', defaultMessage: '{acct} was rejected.' },
});

interface IUnapprovedAccount {
  accountId: string
}

/** Displays an unapproved account for moderation purposes. */
const UnapprovedAccount: React.FC<IUnapprovedAccount> = ({ accountId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const getAccount = useCallback(makeGetAccount(), []);

  const account = useAppSelector(state => getAccount(state, accountId));
  const adminAccount = useAppSelector(state => state.admin.users.get(accountId));

  if (!account) return null;

  const handleApprove = () => {
    dispatch(approveUsers([account.id]))
      .then(() => {
        const message = intl.formatMessage(messages.approved, { acct: `@${account.acct}` });
        toast.success(message);
      })
      .catch(() => {});
  };

  const handleReject = () => {
    dispatch(rejectUserModal(intl, account.id, () => {
      const message = intl.formatMessage(messages.rejected, { acct: `@${account.acct}` });
      toast.info(message);
    }));
  };

  return (
    <HStack space={4} justifyContent='between'>
      <Stack space={1}>
        <Text weight='semibold'>
          @{account.get('acct')}
        </Text>
        <Text tag='blockquote' size='sm'>
          {adminAccount?.invite_request || ''}
        </Text>
      </Stack>

      <HStack space={2} alignItems='center'>
        <IconButton
          src={require('@tabler/icons/check.svg')}
          onClick={handleApprove}
          theme='outlined'
          iconClassName='p-1 text-gray-600 dark:text-gray-400'
        />
        <IconButton
          src={require('@tabler/icons/x.svg')}
          onClick={handleReject}
          theme='outlined'
          iconClassName='p-1 text-gray-600 dark:text-gray-400'
        />
      </HStack>
    </HStack>
  );
};

export default UnapprovedAccount;
