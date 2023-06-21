import React from 'react';

import { approveUsers, deleteUsers } from 'soapbox/actions/admin';
import { useAccount } from 'soapbox/api/hooks';
import { AuthorizeRejectButtons } from 'soapbox/components/authorize-reject-buttons';
import { Stack, HStack, Text } from 'soapbox/components/ui';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks';

interface IUnapprovedAccount {
  accountId: string
}

/** Displays an unapproved account for moderation purposes. */
const UnapprovedAccount: React.FC<IUnapprovedAccount> = ({ accountId }) => {
  const dispatch = useAppDispatch();

  const { account } = useAccount(accountId);
  const adminAccount = useAppSelector(state => state.admin.users.get(accountId));

  if (!account) return null;

  const handleApprove = () => dispatch(approveUsers([account.id]));
  const handleReject = () => dispatch(deleteUsers([account.id]));

  return (
    <HStack space={4} justifyContent='between'>
      <Stack space={1}>
        <Text weight='semibold'>
          @{account.acct}
        </Text>
        <Text tag='blockquote' size='sm'>
          {adminAccount?.invite_request || ''}
        </Text>
      </Stack>

      <Stack justifyContent='center'>
        <AuthorizeRejectButtons
          onAuthorize={handleApprove}
          onReject={handleReject}
          countdown={3000}
        />
      </Stack>
    </HStack>
  );
};

export default UnapprovedAccount;
